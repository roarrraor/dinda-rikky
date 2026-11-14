"use client";
import { createContext, useContext } from "react";

/** true = mode pratinjau/demo; form RSVP tidak mengirim apa pun. */
export const PreviewContext = createContext<boolean>(false);
export const usePreview = () => useContext(PreviewContext);
