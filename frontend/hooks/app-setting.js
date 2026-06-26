// components/AppInitializer.js
"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSetting } from "../lib/store/features/appSettingsSlice";

export function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.appSettings);

  useEffect(() => {
    if (status === "idle") {
      dispatch(getSetting());
    }
  }, [status, dispatch]);

  return children;
}
