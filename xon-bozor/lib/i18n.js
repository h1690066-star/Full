import { cookies } from "next/headers";
import { dictionaries } from "./dictionaries";

export async function getLang() {
  const store = await cookies();
  const lang = store.get("lang")?.value;
  return dictionaries[lang] ? lang : "uz";
}

export async function getT() {
  const lang = await getLang();
  return { lang, t: dictionaries[lang] };
}
