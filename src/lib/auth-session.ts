import { cache } from "react";
import { auth } from "@/auth";

/** Dedupe session lookup within a single RSC request. */
export const getSession = cache(() => auth());
