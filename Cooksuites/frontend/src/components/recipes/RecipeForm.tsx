'use client';
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { StepItem } from './StepItem';
import { IngredientsFieldArray } from './IngredientsFieldArray';
import { recipeService } from '@/services/recipeService';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import {
  FileText,
  UtensilsCrossed,
  Plus,
  Clock,
  Zap,
  Image as ImageIcon,
  Camera,
  Save,
  Loader2,
  Users
} from 'lucide-react';
import Image from 'next/image';

const recipeSchema = z.object({
  title: z.string().min(3, 'Title is too short').max(200),
  mealType: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']),
  cuisine: z.string().optional(),
  hours: z.coerce.number().min(0),
  minutes: z.coerce.number().min(0).max(59),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  servings: z.coerce.number().int().positive().default(1),
  ingredients: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    quantity: z.coerce.number().positive('Must be > 0'),
    unit: z.string().min(1)
  })).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.object({
    description: z.string().min(1),
    imageUrl: z.string().optional()
  })).min(1, 'At least one step is required'),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  initialValues?: any;
  isEditMode?: boolean;
}

export function RecipeForm({ initialValues, isEditMode = false }: RecipeFormProps) {
  const router = useRouter();
  const { id: recipeId } = useParams();
  const { token } = useSelector((state: RootState) => state.auth);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [stepImages, setStepImages] = useState<Record<number, File | null>>({});
  const [stepImagePreviews, setStepImagePreviews] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      mealType: 'Dinner',
      difficulty: 'Medium',
      hours: 0,
      minutes: 30,
      ingredients: [{ name: '', quantity: 1, unit: 'g' }],
      instructions: [{ description: '' }],
      servings: 2
    }
  } as any);

  useEffect(() => {
    if (initialValues) {
      const hours = Math.floor((initialValues.cookingTimeMinutes || 0) / 60);
      const minutes = (initialValues.cookingTimeMinutes || 0) % 60;

      let parsedIngredients = initialValues.ingredients;
      if (typeof parsedIngredients === 'string') {
        try { parsedIngredients = JSON.parse(parsedIngredients); } catch (e) { parsedIngredients = []; }
      }

      let parsedInstructions = initialValues.instructions;
      if (typeof parsedInstructions === 'string') {
        try { parsedInstructions = JSON.parse(parsedInstructions); } catch (e) { parsedInstructions = []; }
      }

      reset({
        title: initialValues.title,
        mealType: initialValues.mealType || 'Dinner',
        cuisine: initialValues.cuisine || '',
        hours,
        minutes,
        difficulty: initialValues.difficulty || 'Medium',
        servings: initialValues.servings || 2,
        ingredients: parsedIngredients || [{ name: '', quantity: 1, unit: 'g' }],
        instructions: parsedInstructions || [{ description: '' }]
      });

      if (initialValues.images?.[0]?.url) {
        const url = initialValues.images[0].url.startsWith('http')
          ? initialValues.images[0].url
          : `http://localhost:4000${initialValues.images[0].url}`;
        setMainImagePreview(url);
      }

      if (parsedInstructions && Array.isArray(parsedInstructions)) {
        const previews: Record<number, string> = {};
        parsedInstructions.forEach((step: any, index: number) => {
          if (step.imageUrl) {
            previews[index] = step.imageUrl.startsWith('http')
              ? step.imageUrl
              : `http://localhost:4000${step.imageUrl}`;
          }
        });
        setStepImagePreviews(previews);
      }
    }
  }, [initialValues, reset]);

  // Removed RTK Query mutation as we use Axios now

  const { fields, append, remove: originalRemove } = useFieldArray({
    control,
    name: "instructions"
  });

  const remove = (index: number) => {
    originalRemove(index);
    // Cleanup step images state
    const newStepImages = { ...stepImages };
    const newStepImagePreviews = { ...stepImagePreviews };
    delete newStepImages[index];
    delete newStepImagePreviews[index];

    // Shift indices
    const shiftedImages: Record<number, File | null> = {};
    const shiftedPreviews: Record<number, string> = {};
    Object.keys(newStepImages).forEach((key) => {
      const k = parseInt(key);
      if (k > index) {
        shiftedImages[k - 1] = newStepImages[k];
        shiftedPreviews[k - 1] = newStepImagePreviews[k];
      } else {
        shiftedImages[k] = newStepImages[k];
        shiftedPreviews[k] = newStepImagePreviews[k];
      }
    });
    setStepImages(shiftedImages);
    setStepImagePreviews(shiftedPreviews);
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMainImage(file);
    if (file) {
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleStepImageChange = (index: number, file: File | null) => {
    setStepImages(prev => ({ ...prev, [index]: file }));
    if (file) {
      setStepImagePreviews(prev => ({ ...prev, [index]: URL.createObjectURL(file) }));
    } else {
      setStepImagePreviews(prev => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:4000/api/v1/media', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'File upload failed');
    }
    const data = await res.json();
    return data.data.url;
  };

  const onSubmit = async (values: RecipeFormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Upload step images if any
      const instructions = await Promise.all(values.instructions.map(async (step, index) => {
        let imageUrl = step.imageUrl;
        // Check if there's a new file selected for this step
        if (stepImages[index]) {
          imageUrl = await uploadFile(stepImages[index]!);
        }
        return { ...step, imageUrl };
      }));

      // 2. Prepare final form data
      const totalMinutes = (values.hours * 60) + (values.minutes || 0);
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('cookingTimeMinutes', totalMinutes.toString());
      formData.append('difficulty', values.difficulty);
      formData.append('mealType', values.mealType);
      formData.append('cuisine', values.cuisine || '');
      formData.append('servings', values.servings.toString());

      // Send ingredients and instructions as JSON strings (Backend will parse them)
      formData.append('ingredients', JSON.stringify(values.ingredients));
      formData.append('instructions', JSON.stringify(instructions));

      if (mainImage) {
        formData.append('image', mainImage);
      }

      // Log for debugging (FormData needs entries() iteration to see content)
      console.log('Sending Recipe Data:');
      formData.forEach((value, key) => {
        console.log(`  ${key}:`, value);
      });

      let res;
      if (isEditMode && recipeId) {
        res = await recipeService.updateRecipe(recipeId as string, formData);
      } else {
        res = await recipeService.createRecipe(formData);
      }

      if (res.success) {
        router.push(isEditMode ? `/recipes/${recipeId}` : '/dashboard');
      } else {
        throw new Error('Failed to save recipe');
      }
    } catch (err: unknown) {
      console.error('Submission error:', err);
      alert(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // @ts-ignore
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-lg items-start">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-lg">
        {/* Basic Info */}
        <section className="bg-white border border-outline-variant rounded-xl p-lg flex flex-col gap-lg shadow-sm">
          <div className="flex items-center gap-sm">
            <FileText className="text-primary h-6 w-6" />
            <h2 className="font-headline-md text-headline-md">Basic Information</h2>
          </div>
          <div className="grid grid-cols-1 gap-lg">
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Recipe Title</label>
              <input
                {...register('title')}
                className={`w-full rounded-lg border px-md py-sm focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary transition-all outline-none ${errors.title ? 'border-error' : 'border-outline-variant'}`}
                placeholder="e.g. Herb-Crusted Roasted Salmon"
                type="text"
              />
              {errors.title && <p className="text-error text-xs">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-lg">
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Meal Type</label>
                <select
                  {...register('mealType')}
                  className="w-full rounded-lg border border-outline-variant px-md py-sm focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary transition-all outline-none bg-transparent"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                  <option value="Dessert">Dessert</option>
                </select>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase flex justify-between">
                  Cuisine
                  <span className="text-[10px] lowercase opacity-60">(Optional)</span>
                </label>
                <input
                  {...register('cuisine')}
                  className="w-full rounded-lg border border-outline-variant px-md py-sm focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary transition-all outline-none"
                  placeholder="e.g. Nordic, Italian"
                  type="text"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Ingredients Section */}
        <section className="bg-white border border-outline-variant rounded-xl p-lg flex flex-col gap-lg shadow-sm">
          <IngredientsFieldArray control={control} register={register} errors={errors} />
        </section>

        {/* Dynamic Steps */}
        <section className="bg-white border border-outline-variant rounded-xl p-lg flex flex-col gap-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-sm">
              <UtensilsCrossed className="text-primary h-6 w-6" />
              <h2 className="font-headline-md text-headline-md">Preparation Steps</h2>
            </div>
            <button
              type="button"
              onClick={() => append({ description: '' })}
              className="text-primary font-label-sm uppercase flex items-center gap-1 hover:bg-primary-container/10 px-3 py-1 rounded-full transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Step
            </button>
          </div>

          <div className="flex flex-col gap-lg">
            {fields.map((field, index) => (
              <StepItem
                key={field.id}
                index={index}
                register={register}
                remove={() => remove(index)}
                errors={errors}
                onImageChange={handleStepImageChange}
                previewUrl={stepImagePreviews[index]}
              />
            ))}
          </div>
        </section>
      </div>

      <aside className="col-span-12 lg:col-span-4 flex flex-col gap-lg sticky top-24">
        {/* Metadata */}
        <section className="bg-white border border-outline-variant rounded-xl p-lg flex flex-col gap-lg shadow-sm">
          <h3 className="font-headline-md text-headline-md">Recipe Details</h3>
          <div className="flex flex-col gap-md">
            <div className="flex items-center justify-between py-xs border-b border-surface-container-highest">
              <div className="flex items-center gap-sm text-on-surface-variant">
                <Clock className="h-5 w-5" />
                <span className="font-label-sm uppercase">Cook Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <input {...register('hours')} className="w-10 text-right border-none bg-transparent font-bold text-primary focus:ring-0 outline-none p-0" type="number" />
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">h</span>
                </div>
                <div className="flex items-center gap-1 border-l pl-2 border-outline-variant">
                  <input {...register('minutes')} className="w-10 text-right border-none bg-transparent font-bold text-primary focus:ring-0 outline-none p-0" type="number" />
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">m</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-xs">
              <div className="flex items-center gap-sm text-on-surface-variant">
                <Zap className="h-5 w-5" />
                <span className="font-label-sm uppercase">Difficulty</span>
              </div>
              <select {...register('difficulty')} className="border-none bg-transparent font-bold text-primary focus:ring-0 py-0 cursor-pointer text-right outline-none">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-xs border-t border-surface-container-highest">
              <div className="flex items-center gap-sm text-on-surface-variant">
                <Users className="h-5 w-5" />
                <span className="font-label-sm uppercase">Servings</span>
              </div>
              <div className="flex items-center gap-1">
                <input {...register('servings')} className="w-10 text-right border-none bg-transparent font-bold text-primary focus:ring-0 outline-none p-0" type="number" min="1" />
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">ppl</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Photo */}
        <section className="bg-white border border-outline-variant rounded-xl p-lg flex flex-col gap-md shadow-sm">
          <h3 className="font-headline-md text-headline-md">Main Photo</h3>
          <div className="relative group cursor-pointer overflow-hidden rounded-lg aspect-video bg-surface-container-low border border-outline-variant flex flex-col items-center justify-center gap-sm transition-all hover:bg-surface-container">
            {mainImagePreview ? (
              <Image className="absolute inset-0 w-full h-full object-cover" height={400} width={400} src={mainImagePreview} alt="Preview" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="h-8 w-8 text-outline-variant" />
                <span className="font-label-sm uppercase text-outline-variant">Add Cover Photo</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="text-white h-8 w-8" />
            </div>
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" accept="image/*" onChange={handleMainImageChange} />
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col gap-sm">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-on-primary rounded-xl py-md font-headline-md flex items-center justify-center gap-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Recipe' : 'Publish Recipe'}
          </button>
          <button type="button" onClick={() => router.push('/dashboard')} className="w-full text-error font-label-sm uppercase py-sm hover:bg-error-container/20 rounded-lg transition-colors cursor-pointer">
            Discard Changes
          </button>
        </div>
      </aside>
    </form>
  );
}
