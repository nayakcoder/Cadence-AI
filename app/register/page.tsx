"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", orgName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <CardHeader className="text-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold mx-auto mb-4">C</div>
          <CardTitle className="text-white text-2xl">Create Account</CardTitle>
          <CardDescription className="text-slate-400">Start your AI-powered outreach today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-slate-300" htmlFor="name">Full Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white mt-1" placeholder="John Smith" required />
            </div>
            <div>
              <Label className="text-slate-300" htmlFor="orgName">Company Name</Label>
              <Input id="orgName" value={form.orgName} onChange={(e) => setForm({...form, orgName: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white mt-1" placeholder="Acme Corp" required />
            </div>
            <div>
              <Label className="text-slate-300" htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white mt-1" placeholder="you@company.com" required />
            </div>
            <div>
              <Label className="text-slate-300" htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white mt-1" minLength={8} required />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-slate-400 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:underline ml-1">Sign in</Link>
        </CardFooter>
      </Card>
    </div>
  );
}