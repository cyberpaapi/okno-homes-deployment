import { afterEach, describe, expect, it, vi } from 'vitest';
import { announcePreviewReady, isEmbeddedSitePreview, PREVIEW_READY } from './sitePreview';
const parentDescriptor=Object.getOwnPropertyDescriptor(window,'parent')!;
afterEach(()=>{Object.defineProperty(window,'parent',parentDescriptor);vi.unstubAllGlobals();});
describe('preview readiness',()=>{
 it('does not notify a parent on standalone pages',()=>{expect(isEmbeddedSitePreview()).toBe(false);const post=vi.spyOn(window,'postMessage');announcePreviewReady();expect(post).not.toHaveBeenCalled();post.mockRestore();});
 it('notifies the exact same-origin parent after the receiver is installed',()=>{const postMessage=vi.fn();Object.defineProperty(window,'parent',{configurable:true,value:{postMessage}});expect(isEmbeddedSitePreview()).toBe(true);announcePreviewReady();expect(postMessage).toHaveBeenCalledWith({type:PREVIEW_READY},window.location.origin);});
});
