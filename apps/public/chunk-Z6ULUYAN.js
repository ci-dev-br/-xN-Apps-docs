import{a as tt,b as et,c as ot,d as c,e as u}from"./chunk-LQMSW56O.js";import{G as a,da as l,ia as f,w as s}from"./chunk-ROCTAVHX.js";var m=(()=>{let t=class t{constructor(){this.rootUrl=""}};t.\u0275fac=function(e){return new(e||t)},t.\u0275prov=l({token:t,factory:t.\u0275fac,providedIn:"root"});let n=t;return n})();var h=(()=>{let t=class t{constructor(o,e){this.config=o,this.http=e}get rootUrl(){return this._rootUrl||this.config.rootUrl}set rootUrl(o){this._rootUrl=o}};t.\u0275fac=function(e){return new(e||t)(f(m),f(u))},t.\u0275prov=l({token:t,factory:t.\u0275fac});let n=t;return n})();var Y=class{encodeKey(t){return encodeURIComponent(t)}encodeValue(t){return encodeURIComponent(t)}decodeKey(t){return decodeURIComponent(t)}decodeValue(t){return decodeURIComponent(t)}},rt=new Y,R=class{constructor(t,i,o,e,r){this.name=t,this.value=i,this.options=o,this.options=o||{},(this.options.style===null||this.options.style===void 0)&&(this.options.style=e),(this.options.explode===null||this.options.explode===void 0)&&(this.options.explode=r)}serializeValue(t,i=","){if(t==null)return"";if(t instanceof Array)return t.map(o=>this.serializeValue(o).split(i).join(encodeURIComponent(i))).join(i);if(typeof t=="object"){let o=[];for(let e of Object.keys(t)){let r=t[e];r!=null&&(r=this.serializeValue(r).split(i).join(encodeURIComponent(i)),this.options.explode?o.push(`${e}=${r}`):(o.push(e),o.push(r)))}return o.join(i)}else return String(t)}},Z=class extends R{constructor(t,i,o){super(t,i,o,"simple",!1)}append(t){let i=this.value;i==null&&(i="");let o=this.options.style==="label"?".":"",e=this.options.explode?o===""?",":o:",",r=!1;return this.options.style==="matrix"&&(o=`;${this.name}=`,this.options.explode&&typeof i=="object"&&(o=";",i instanceof Array?(i=i.map(d=>`${this.name}=${this.serializeValue(d,";")}`),i=i.join(";"),r=!0):(i=this.serializeValue(i,";"),r=!0))),i=o+(r?i:this.serializeValue(i,e)),t=t.replace(`{${this.name}}`,i),t=t.replace(`{${o}${this.name}${this.options.explode?"*":""}}`,i),t}serializeValue(t,i=","){var o=typeof t=="string"?encodeURIComponent(t):super.serializeValue(t,i);return o=o.replace(/%3D/g,"="),o=o.replace(/%3B/g,";"),o=o.replace(/%2C/g,","),o}},Q=class extends R{constructor(t,i,o){super(t,i,o,"form",!0)}append(t){if(this.value instanceof Array)if(this.options.explode)for(let i of this.value)t=t.append(this.name,this.serializeValue(i));else{let i=this.options.style==="spaceDelimited"?" ":this.options.style==="pipeDelimited"?"|":",";return t.append(this.name,this.serializeValue(this.value,i))}else if(this.value!==null&&typeof this.value=="object")if(this.options.style==="deepObject")for(let i of Object.keys(this.value)){let o=this.value[i];o!=null&&(t=t.append(`${this.name}[${i}]`,this.serializeValue(o)))}else if(this.options.explode)for(let i of Object.keys(this.value)){let o=this.value[i];o!=null&&(t=t.append(i,this.serializeValue(o)))}else{let i=[];for(let o of Object.keys(this.value)){let e=this.value[o];e!=null&&(i.push(o),i.push(e))}t=t.append(this.name,this.serializeValue(i))}else this.value!==null&&this.value!==void 0&&(t=t.append(this.name,this.serializeValue(this.value)));return t}},_=class extends R{constructor(t,i,o){super(t,i,o,"simple",!1)}append(t){if(this.value!==null&&this.value!==void 0)if(this.value instanceof Array)for(let i of this.value)t=t.append(this.name,this.serializeValue(i));else t=t.append(this.name,this.serializeValue(this.value));return t}},p=class{constructor(t,i,o){this.rootUrl=t,this.operationPath=i,this.method=o,this._path=new Map,this._query=new Map,this._header=new Map}path(t,i,o){this._path.set(t,new Z(t,i,o||{}))}query(t,i,o){this._query.set(t,new Q(t,i,o||{}))}header(t,i,o){this._header.set(t,new _(t,i,o||{}))}body(t,i="application/json"){if(t instanceof Blob?this._bodyContentType=t.type:this._bodyContentType=i,this._bodyContentType==="application/x-www-form-urlencoded"&&t!==null&&typeof t=="object"){let o=[];for(let e of Object.keys(t)){let r=t[e];r instanceof Array||(r=[r]);for(let d of r){let P=this.formDataValue(d);P!==null&&o.push([e,P])}}this._bodyContent=o.map(e=>`${encodeURIComponent(e[0])}=${encodeURIComponent(e[1])}`).join("&")}else if(this._bodyContentType==="multipart/form-data"){let o=new FormData;if(t!=null)for(let e of Object.keys(t)){let r=t[e];if(r instanceof Array)for(let d of r){let P=this.formDataValue(d);P!==null&&o.append(e,P)}else{let d=this.formDataValue(r);d!==null&&o.set(e,d)}}this._bodyContent=o}else this._bodyContent=t}formDataValue(t){return t==null?null:t instanceof Blob?t:typeof t=="object"?new Blob([JSON.stringify(t)],{type:"application/json"}):String(t)}build(t){t=t||{};let i=this.operationPath;for(let d of this._path.values())i=d.append(i);let o=this.rootUrl+i,e=new et({encoder:rt});for(let d of this._query.values())e=d.append(e);let r=new tt;t.accept&&(r=r.append("Accept",t.accept));for(let d of this._header.values())r=d.append(r);return this._bodyContentType&&!(this._bodyContent instanceof FormData)&&(r=r.set("Content-Type",this._bodyContentType)),new ot(this.method.toUpperCase(),o,this._bodyContent,{params:e,headers:r,responseType:t.responseType,reportProgress:t.reportProgress,context:t.context})}};function H(n,t,i,o){let e=new p(t,H.PATH,"get");return n.request(e.build({responseType:"text",accept:"*/*",context:o})).pipe(a(r=>r instanceof c),s(r=>r.clone({body:void 0})))}H.PATH="/*";var ht=(()=>{let t=class t extends h{constructor(o,e){super(o,e)}appControllerRoot$Response(o,e){return H(this.http,this.rootUrl,o,e)}appControllerRoot(o,e){return this.appControllerRoot$Response(o,e).pipe(s(r=>r.body))}};t.AppControllerRootPath="/*",t.\u0275fac=function(e){return new(e||t)(f(m),f(u))},t.\u0275prov=l({token:t,factory:t.\u0275fac,providedIn:"root"});let n=t;return n})();function T(n,t,i,o){let e=new p(t,T.PATH,"post");return n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}T.PATH="/System/Leitura";var Ct=(()=>{let t=class t extends h{constructor(o,e){super(o,e)}systemLeitura$Response(o,e){return T(this.http,this.rootUrl,o,e)}systemLeitura(o,e){return this.systemLeitura$Response(o,e).pipe(s(r=>r.body))}};t.SystemLeituraPath="/System/Leitura",t.\u0275fac=function(e){return new(e||t)(f(m),f(u))},t.\u0275prov=l({token:t,factory:t.\u0275fac,providedIn:"root"});let n=t;return n})();function C(n,t,i,o){let e=new p(t,C.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}C.PATH="/Device/Connect";function A(n,t,i,o){let e=new p(t,A.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}A.PATH="/Device/Pool";var St=(()=>{let t=class t extends h{constructor(o,e){super(o,e)}deviceConnect$Response(o,e){return C(this.http,this.rootUrl,o,e)}deviceConnect(o,e){return this.deviceConnect$Response(o,e).pipe(s(r=>r.body))}devicePool$Response(o,e){return A(this.http,this.rootUrl,o,e)}devicePool(o,e){return this.devicePool$Response(o,e).pipe(s(r=>r.body))}};t.DeviceConnectPath="/Device/Connect",t.DevicePoolPath="/Device/Pool",t.\u0275fac=function(e){return new(e||t)(f(m),f(u))},t.\u0275prov=l({token:t,factory:t.\u0275fac,providedIn:"root"});let n=t;return n})();function x(n,t,i,o){let e=new p(t,x.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}x.PATH="/auth/Acessar";function $(n,t,i,o){let e=new p(t,$.PATH,"post");return n.request(e.build({responseType:"text",accept:"*/*",context:o})).pipe(a(r=>r instanceof c),s(r=>r.clone({body:void 0})))}$.PATH="/auth/Logout";function g(n,t,i,o){let e=new p(t,g.PATH,"post");return n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}g.PATH="/auth/Profile";function q(n,t,i,o){let e=new p(t,q.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}q.PATH="/auth/Refresh";function w(n,t,i,o){let e=new p(t,w.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}w.PATH="/auth/Registrar";var ue=(()=>{let t=class t extends h{constructor(o,e){super(o,e)}registrar$Response(o,e){return w(this.http,this.rootUrl,o,e)}registrar(o,e){return this.registrar$Response(o,e).pipe(s(r=>r.body))}profile$Response(o,e){return g(this.http,this.rootUrl,o,e)}profile(o,e){return this.profile$Response(o,e).pipe(s(r=>r.body))}acessar$Response(o,e){return x(this.http,this.rootUrl,o,e)}acessar(o,e){return this.acessar$Response(o,e).pipe(s(r=>r.body))}logout$Response(o,e){return $(this.http,this.rootUrl,o,e)}logout(o,e){return this.logout$Response(o,e).pipe(s(r=>r.body))}refresh$Response(o,e){return q(this.http,this.rootUrl,o,e)}refresh(o,e){return this.refresh$Response(o,e).pipe(s(r=>r.body))}};t.RegistrarPath="/auth/Registrar",t.ProfilePath="/auth/Profile",t.AcessarPath="/auth/Acessar",t.LogoutPath="/auth/Logout",t.RefreshPath="/auth/Refresh",t.\u0275fac=function(e){return new(e||t)(f(m),f(u))},t.\u0275prov=l({token:t,factory:t.\u0275fac,providedIn:"root"});let n=t;return n})();function U(n,t,i,o){let e=new p(t,U.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}U.PATH="/Application/Delete";function I(n,t,i,o){let e=new p(t,I.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}I.PATH="/Application/Get";function G(n,t,i,o){let e=new p(t,G.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}G.PATH="/Application/Sync";var Ie=(()=>{let t=class t extends h{constructor(o,e){super(o,e)}get$Response(o,e){return I(this.http,this.rootUrl,o,e)}get(o,e){return this.get$Response(o,e).pipe(s(r=>r.body))}sync$Response(o,e){return G(this.http,this.rootUrl,o,e)}sync(o,e){return this.sync$Response(o,e).pipe(s(r=>r.body))}delete$Response(o,e){return U(this.http,this.rootUrl,o,e)}delete(o,e){return this.delete$Response(o,e).pipe(s(r=>r.body))}};t.GetPath="/Application/Get",t.SyncPath="/Application/Sync",t.DeletePath="/Application/Delete",t.\u0275fac=function(e){return new(e||t)(f(m),f(u))},t.\u0275prov=l({token:t,factory:t.\u0275fac,providedIn:"root"});let n=t;return n})();function B(n,t,i,o){let e=new p(t,B.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}B.PATH="/Domain/Delete";function z(n,t,i,o){let e=new p(t,z.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}z.PATH="/Domain/Sync";var Je=(()=>{let t=class t extends h{constructor(o,e){super(o,e)}domainSync$Response(o,e){return z(this.http,this.rootUrl,o,e)}domainSync(o,e){return this.domainSync$Response(o,e).pipe(s(r=>r.body))}domainDelete$Response(o,e){return B(this.http,this.rootUrl,o,e)}domainDelete(o,e){return this.domainDelete$Response(o,e).pipe(s(r=>r.body))}};t.DomainSyncPath="/Domain/Sync",t.DomainDeletePath="/Domain/Delete",t.\u0275fac=function(e){return new(e||t)(f(m),f(u))},t.\u0275prov=l({token:t,factory:t.\u0275fac,providedIn:"root"});let n=t;return n})();function k(n,t,i,o){let e=new p(t,k.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}k.PATH="/Product/Get";function D(n,t,i,o){let e=new p(t,D.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}D.PATH="/Product/Sync";var no=(()=>{let t=class t extends h{constructor(o,e){super(o,e)}productSync$Response(o,e){return D(this.http,this.rootUrl,o,e)}productSync(o,e){return this.productSync$Response(o,e).pipe(s(r=>r.body))}productGet$Response(o,e){return k(this.http,this.rootUrl,o,e)}productGet(o,e){return this.productGet$Response(o,e).pipe(s(r=>r.body))}};t.ProductSyncPath="/Product/Sync",t.ProductGetPath="/Product/Get",t.\u0275fac=function(e){return new(e||t)(f(m),f(u))},t.\u0275prov=l({token:t,factory:t.\u0275fac,providedIn:"root"});let n=t;return n})();function S(n,t,i,o){let e=new p(t,S.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}S.PATH="/Prancheta/Get";function V(n,t,i,o){let e=new p(t,V.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}V.PATH="/Prancheta/Sync";var Ro=(()=>{let t=class t extends h{constructor(o,e){super(o,e)}pranchetaControllerSync$Response(o,e){return V(this.http,this.rootUrl,o,e)}pranchetaControllerSync(o,e){return this.pranchetaControllerSync$Response(o,e).pipe(s(r=>r.body))}pranchetaControllerGet$Response(o,e){return S(this.http,this.rootUrl,o,e)}pranchetaControllerGet(o,e){return this.pranchetaControllerGet$Response(o,e).pipe(s(r=>r.body))}};t.PranchetaControllerSyncPath="/Prancheta/Sync",t.PranchetaControllerGetPath="/Prancheta/Get",t.\u0275fac=function(e){return new(e||t)(f(m),f(u))},t.\u0275prov=l({token:t,factory:t.\u0275fac,providedIn:"root"});let n=t;return n})();function F(n,t,i,o){let e=new p(t,F.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}F.PATH="/User/Sync";function v(n,t,i,o){let e=new p(t,v.PATH,"post");return n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}v.PATH="/User/GetList";var zo=(()=>{let t=class t extends h{constructor(o,e){super(o,e)}syncUser$Response(o,e){return F(this.http,this.rootUrl,o,e)}syncUser(o,e){return this.syncUser$Response(o,e).pipe(s(r=>r.body))}userGetList$Response(o,e){return v(this.http,this.rootUrl,o,e)}userGetList(o,e){return this.userGetList$Response(o,e).pipe(s(r=>r.body))}};t.SyncUserPath="/User/Sync",t.UserGetListPath="/User/GetList",t.\u0275fac=function(e){return new(e||t)(f(m),f(u))},t.\u0275prov=l({token:t,factory:t.\u0275fac,providedIn:"root"});let n=t;return n})();function L(n,t,i,o){let e=new p(t,L.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}L.PATH="/Photo/Get";function O(n,t,i,o){let e=new p(t,O.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}O.PATH="/Photo/SendPart";function M(n,t,i,o){let e=new p(t,M.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}M.PATH="/Photo/Sync";var _o=(()=>{let t=class t extends h{constructor(o,e){super(o,e)}syncPhoto$Response(o,e){return M(this.http,this.rootUrl,o,e)}syncPhoto(o,e){return this.syncPhoto$Response(o,e).pipe(s(r=>r.body))}sendPartPhoto$Response(o,e){return O(this.http,this.rootUrl,o,e)}sendPartPhoto(o,e){return this.sendPartPhoto$Response(o,e).pipe(s(r=>r.body))}getPhoto$Response(o,e){return L(this.http,this.rootUrl,o,e)}getPhoto(o,e){return this.getPhoto$Response(o,e).pipe(s(r=>r.body))}};t.SyncPhotoPath="/Photo/Sync",t.SendPartPhotoPath="/Photo/SendPart",t.GetPhotoPath="/Photo/Get",t.\u0275fac=function(e){return new(e||t)(f(m),f(u))},t.\u0275prov=l({token:t,factory:t.\u0275fac,providedIn:"root"});let n=t;return n})();function K(n,t,i,o){let e=new p(t,K.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}K.PATH="/Cadastro/All";var ar=(()=>{let t=class t extends h{constructor(o,e){super(o,e)}cadastroControllerGetAll$Response(o,e){return K(this.http,this.rootUrl,o,e)}cadastroControllerGetAll(o,e){return this.cadastroControllerGetAll$Response(o,e).pipe(s(r=>r.body))}};t.CadastroControllerGetAllPath="/Cadastro/All",t.\u0275fac=function(e){return new(e||t)(f(m),f(u))},t.\u0275prov=l({token:t,factory:t.\u0275fac,providedIn:"root"});let n=t;return n})();function J(n,t,i,o){let e=new p(t,J.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}J.PATH="/Pessoa/Get";function N(n,t,i,o){let e=new p(t,N.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}N.PATH="/Pessoa/Sync";var Tr=(()=>{let t=class t extends h{constructor(o,e){super(o,e)}pessoaSync$Response(o,e){return N(this.http,this.rootUrl,o,e)}pessoaSync(o,e){return this.pessoaSync$Response(o,e).pipe(s(r=>r.body))}pessoaGet$Response(o,e){return J(this.http,this.rootUrl,o,e)}pessoaGet(o,e){return this.pessoaGet$Response(o,e).pipe(s(r=>r.body))}};t.PessoaSyncPath="/Pessoa/Sync",t.PessoaGetPath="/Pessoa/Get",t.\u0275fac=function(e){return new(e||t)(f(m),f(u))},t.\u0275prov=l({token:t,factory:t.\u0275fac,providedIn:"root"});let n=t;return n})();function E(n,t,i,o){let e=new p(t,E.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}E.PATH="/Organizacao/Find";function W(n,t,i,o){let e=new p(t,W.PATH,"post");return n.request(e.build({responseType:"json",accept:"application/json",context:o})).pipe(a(r=>r instanceof c),s(r=>r))}W.PATH="/Organizacao/GetCurrent";function X(n,t,i,o){let e=new p(t,X.PATH,"post");return i&&e.body(i.body,"application/json"),n.request(e.build({responseType:"text",accept:"*/*",context:o})).pipe(a(r=>r instanceof c),s(r=>r.clone({body:void 0})))}X.PATH="/Organizacao/Sync";var Lr=(()=>{let t=class t extends h{constructor(o,e){super(o,e)}organizacaoSync$Response(o,e){return X(this.http,this.rootUrl,o,e)}organizacaoSync(o,e){return this.organizacaoSync$Response(o,e).pipe(s(r=>r.body))}organizacaoGetCurrent$Response(o,e){return W(this.http,this.rootUrl,o,e)}organizacaoGetCurrent(o,e){return this.organizacaoGetCurrent$Response(o,e).pipe(s(r=>r.body))}organizacaoFind$Response(o,e){return E(this.http,this.rootUrl,o,e)}organizacaoFind(o,e){return this.organizacaoFind$Response(o,e).pipe(s(r=>r.body))}};t.OrganizacaoSyncPath="/Organizacao/Sync",t.OrganizacaoGetCurrentPath="/Organizacao/GetCurrent",t.OrganizacaoFindPath="/Organizacao/Find",t.\u0275fac=function(e){return new(e||t)(f(m),f(u))},t.\u0275prov=l({token:t,factory:t.\u0275fac,providedIn:"root"});let n=t;return n})();export{m as a,ht as b,Ct as c,St as d,ue as e,Ie as f,Je as g,no as h,Ro as i,zo as j,_o as k,ar as l,Tr as m,Lr as n};
