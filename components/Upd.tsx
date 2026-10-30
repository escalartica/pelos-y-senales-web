"use client";
import type { Dog } from "@/lib/data";
import { useOverrides } from "@/lib/store";
export default function Upd({ d }: { d: Dog }) { const { ov } = useOverrides(); return <>{ov[d.id]?.upd ?? d.upd}</>; }
