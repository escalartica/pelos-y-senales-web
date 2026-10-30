"use client";
import FavButton from "./FavButton";
export default function StickyBar({ id }: { id: string }) {
  return <div className="stickybar on"><a className="btn coral" href="#consulta">Me interesa conocerle</a><FavButton id={id} big /></div>;
}
