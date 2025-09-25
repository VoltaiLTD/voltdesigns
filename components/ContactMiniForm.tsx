"use client";
import { useState } from "react";
export default function ContactMiniForm({ service }:{ service:string }){
  const [loading,setLoading]=useState(false); const [ok,setOk]=useState<null|boolean>(null);
  const [form,setForm]=useState({name:"",email:"",phone:"",message:""});
  async function onSubmit(e:React.FormEvent){ e.preventDefault(); setLoading(true); setOk(null);
    try{
      const res=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,service})});
      setOk(res.ok); if(res.ok) setForm({name:"",email:"",phone:"",message:""});
    }catch{ setOk(false);} finally{ setLoading(false); }
  }
  return (<form onSubmit={onSubmit} className="card">
    <h3 className="font-semibold">Tell us about your project</h3>
    <div className="grid gap-2 mt-3">
      <input required placeholder="Full name" className="rounded-xl px-3 py-2 bg-[#111] border border-white/15" value={form.name} onChange={e=>setForm(s=>({...s,name:e.target.value}))}/>
      <input required type="email" placeholder="Email" className="rounded-xl px-3 py-2 bg-[#111] border border-white/15" value={form.email} onChange={e=>setForm(s=>({...s,email:e.target.value}))}/>
      <input placeholder="Phone (optional)" className="rounded-xl px-3 py-2 bg-[#111] border border-white/15" value={form.phone} onChange={e=>setForm(s=>({...s,phone:e.target.value}))}/>
      <textarea required placeholder="Describe your space, timeline & budget" className="rounded-xl px-3 py-2 bg-[#111] border border-white/15 min-h-[90px]" value={form.message} onChange={e=>setForm(s=>({...s,message:e.target.value}))}/>
      <button className="btn btn-gold" disabled={loading}>{loading?"Sending...":"Send Enquiry"}</button>
      {ok===true && <p className="text-green-400 text-sm">Thanks! We’ll get back to you shortly.</p>}
      {ok===false && <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>}
    </div>
  </form>);
}
