import{S as w,i as y,s as B,e as b,t as L,k,c as v,a as R,g as j,d as l,n as h,b as T,F as A,f as d,G as E,M,K as U,O as q,j as C,m as D,o as K,x as N,u as F,v as G}from"../chunks/vendor-055e1022.js";function I(u){let e,n,a,r,f,i,m,_,s,c,p,$,x;return{c(){e=b("button"),n=L("Record"),a=k(),r=b("button"),f=L("Stop"),i=k(),m=b("br"),_=k(),s=b("audio"),c=b("track"),this.h()},l(t){e=v(t,"BUTTON",{});var o=R(e);n=j(o,"Record"),o.forEach(l),a=h(t),r=v(t,"BUTTON",{});var O=R(r);f=j(O,"Stop"),O.forEach(l),i=h(t),m=v(t,"BR",{}),_=h(t),s=v(t,"AUDIO",{src:!0});var S=R(s);c=v(S,"TRACK",{kind:!0}),S.forEach(l),this.h()},h(){T(c,"kind","captions"),s.controls=!0,A(s.src,p=u[0])||T(s,"src",p)},m(t,o){d(t,e,o),E(e,n),d(t,a,o),d(t,r,o),E(r,f),d(t,i,o),d(t,m,o),d(t,_,o),d(t,s,o),E(s,c),$||(x=[M(e,"click",u[1]),M(r,"click",u[2])],$=!0)},p(t,[o]){o&1&&!A(s.src,p=t[0])&&T(s,"src",p)},i:U,o:U,d(t){t&&l(e),t&&l(a),t&&l(r),t&&l(i),t&&l(m),t&&l(_),t&&l(s),$=!1,q(x)}}}function z(u,e,n){let a=null,r=null,f=null,i=null;return[a,()=>{navigator.mediaDevices.getUserMedia({audio:!0}).then(s=>{f=s,i=new MediaRecorder(s),i.start(),r=[],i.addEventListener("dataavailable",c=>{r.push(c.data)}),i.addEventListener("stop",c=>{let p=new Blob(r,{type:"audio/wav; codecs=0"});n(0,a=URL.createObjectURL(p)),console.log("audio url: ",a)})})},()=>{f.getTracks().forEach(s=>{s.stop()})}]}class H extends w{constructor(e){super();y(this,e,z,I,B,{})}}function J(u){let e,n;return e=new H({}),{c(){C(e.$$.fragment)},l(a){D(e.$$.fragment,a)},m(a,r){K(e,a,r),n=!0},p:U,i(a){n||(N(e.$$.fragment,a),n=!0)},o(a){F(e.$$.fragment,a),n=!1},d(a){G(e,a)}}}class Q extends w{constructor(e){super();y(this,e,null,J,B,{})}}export{Q as default};