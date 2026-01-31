import { z } from 'zod';

export const CreateHabitSchema = z.object({
  title: z.string().min(3, "O nome do hábito precisa ter pelo menos 3 letras"),
  description: z.string().optional(),
  goal: z.number().min(1).optional(),
  weekDays: z.array(z.number().min(0).max(6)).min(1, "Selecione pelo menos um dia!"),
});
