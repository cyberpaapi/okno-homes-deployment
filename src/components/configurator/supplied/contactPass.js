import * as THREE from "three";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";

// Resolve short-range contact shadows from the existing depth buffer.
// One scene draw per frame keeps detailed houses and planting interactive.
export function createContactPass(renderer,scene,camera) {
    if (!renderer.extensions.has("EXT_color_buffer_float")) return null;
    const target = new THREE.WebGLRenderTarget(1,1,{
        type:THREE.HalfFloatType, depthTexture:new THREE.DepthTexture(1,1,THREE.UnsignedIntType),
        samples: Math.min(4, renderer.capabilities.maxSamples),
    });
    const material = new THREE.ShaderMaterial({
        uniforms:{
            picture:{value:target.texture},depth:{value:target.depthTexture},resolution:{value:new THREE.Vector2()},
            projection:{value:camera.projectionMatrix},inverseProjection:{value:camera.projectionMatrixInverse},
            clip:{value:new THREE.Vector2()},
        },
        depthTest:false,depthWrite:false,
        vertexShader:`varying vec2 screenUv; void main(){screenUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
        fragmentShader:`uniform sampler2D picture,depth;
        uniform mat4 projection,inverseProjection;
        uniform vec2 clip,resolution; varying vec2 screenUv;
        float viewZ(float d){return clip.x*clip.y/((clip.y-clip.x)*d-clip.y);}
        vec3 positionAt(vec2 uv,float d){vec4 p=inverseProjection*vec4(uv*2.-1.,d*2.-1.,1.);return p.xyz/p.w;}
        void main(){
          vec4 color=texture2D(picture,screenUv);float d=texture2D(depth,screenUv).r;
          vec3 p=positionAt(screenUv,d), normal=normalize(cross(dFdx(p),dFdy(p)));
          if(d<.99997 && color.a>.01){
            vec3 tangent=normalize(cross(abs(normal.z)<.9?vec3(0,0,1):vec3(0,1,0),normal));
            vec3 bitangent=cross(normal,tangent);
            float angle=6.28318*fract(dot(mod(floor(screenUv*resolution),4.),vec2(.375,.25)));
            float occ=0.;
            for(int i=0;i<24;i++){
              float k=(float(i)+.5)/24.,az=angle+float(i)*2.399963;
              float h=.18+.69*fract(float(i)*.6180339),r=sqrt(1.-h*h);
              float radius=.045+.68*k*k;
              vec3 probe=p+(normal*h+r*(tangent*cos(az)+bitangent*sin(az)))*radius;
              vec4 projected=projection*vec4(probe,1.);vec2 uv=projected.xy/projected.w*.5+.5;
              float neighbor=viewZ(texture2D(depth,clamp(uv,0.,1.)).r);
              float delta=neighbor-probe.z;
              occ+=smoothstep(.004,.025,delta)*(1.-smoothstep(radius*.8,radius*2.5,abs(neighbor-p.z)));
            }
            color.rgb*=1.-.72*occ/24.;
          }
          gl_FragColor=color;
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const quad=new FullScreenQuad(material);
    return {
        draw(){
            renderer.getDrawingBufferSize(material.uniforms.resolution.value);
            const {x,y}=material.uniforms.resolution.value;
            if(x!==target.width||y!==target.height)target.setSize(x,y);
            material.uniforms.clip.value.set(camera.near,camera.far);
            renderer.setRenderTarget(target);renderer.render(scene,camera);
            const stats={...renderer.info.render};
            renderer.setRenderTarget(null);quad.render(renderer);return stats;
        },
        dispose(){target.dispose();material.dispose();quad.dispose();}
    };
}
