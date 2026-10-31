import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadHeroMedia } from './downloadHeroMedia';

afterEach(()=>vi.unstubAllGlobals());
describe('complete hero downloads',()=>{
  it('reports actual bytes and waits for EOF even when all expected bytes arrived',async()=>{
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    const body=new ReadableStream<Uint8Array>({start(controller){stream=controller;}});
    vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,status:200,body,headers:new Headers({'content-length':'4'})})));
    const progress=vi.fn(),done=vi.fn();
    const job=downloadHeroMedia('/movie',new AbortController().signal,progress).then(value=>{done();return value;});
    await vi.waitFor(()=>expect(progress).toHaveBeenCalledWith(0));
    stream.enqueue(new Uint8Array([1,2]));
    await vi.waitFor(()=>expect(progress).toHaveBeenLastCalledWith(.5));
    expect(done).not.toHaveBeenCalled();
    stream.enqueue(new Uint8Array([3,4]));
    await vi.waitFor(()=>expect(progress).toHaveBeenLastCalledWith(.999));
    expect(done).not.toHaveBeenCalled();
    stream.close();
    expect(await job).toEqual(new Uint8Array([1,2,3,4]));
    expect(progress).toHaveBeenLastCalledWith(1);
  });
  it('rejects truncated downloads instead of reporting complete',async()=>{
    vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,status:200,body:new ReadableStream({start(c){c.enqueue(new Uint8Array([1]));c.close();}}),headers:new Headers({'content-length':'4'})})));
    const progress=vi.fn();
    await expect(downloadHeroMedia('/movie',new AbortController().signal,progress)).rejects.toThrow('Incomplete');
    expect(progress).not.toHaveBeenCalledWith(1);
  });
  it('does not start a request after cancellation',async()=>{
    const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
    const abort=new AbortController();abort.abort();
    await expect(downloadHeroMedia('/movie',abort.signal,vi.fn())).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });
});
