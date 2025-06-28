type Prompt = {
  id: string;
  name: string;
  prompt: string;
  description: string | null;
  active: boolean;
}

type PromptDatabase = {
  id: string;
  name: string;
  prompt: string;
  description: string | null;
  active?: 0 | 1;
}

export { Prompt, PromptDatabase };
