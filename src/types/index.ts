import { Icons } from "@/constants/icons";
import { ChangeEvent } from "react";

export interface InputProps {
  label?: string;
  icon?: keyof typeof Icons;
  type?: "text" | "email" | "password" | "tel" | "url" | "search" | "number";
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isTextArea?: boolean;
  rows?: number;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  readOnly?: boolean;
  error?: string;
  cols?: number;
}
