import { useContext } from "react";
import { AppContext } from "../app/AppContext";

export default function useFinance() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useFinance deve ser utilizado dentro do AppProvider.");
  }

  return context;
}
