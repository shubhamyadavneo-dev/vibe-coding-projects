"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type ApiResponse = {
  summary?: string;
  warning?: string;
  error?: string;
  fallbackUsed?: boolean;
};

type ExtractTextResponse = {
  extractedText?: string;
  error?: string;
};

export function SummarizerClient() {
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const inputStats = useMemo(() => {
    const chars = input.length;
    const tokenEstimate = Math.ceil(chars / 4);
    return { chars, tokenEstimate };
  }, [input]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) {
      toast.error("Please add a document before summarizing.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data = (await res.json()) as ApiResponse;
      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      if (!data.summary) {
        throw new Error("No summary returned by the API.");
      }

      setSummary(data.summary);

      if (data.warning) {
        toast.warning(data.warning);
      } else if (data.fallbackUsed) {
        toast.message("Fallback summary used due to validation constraints.");
      } else {
        toast.success("Summary generated successfully.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function onFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as ExtractTextResponse;
      if (!res.ok) {
        throw new Error(data.error ?? "Unable to process this file.");
      }
      if (!data.extractedText) {
        throw new Error("No readable text found in the uploaded file.");
      }

      setInput(data.extractedText);
      setSummary("");
      toast.success(`Loaded ${file.name} into the editor.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected upload error";
      toast.error(message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-4 py-10 sm:px-6">
      <Card className="backdrop-blur-xl bg-background/65">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              SaaS Document Summarizer
            </CardTitle>
            <CardDescription>
              Paste your document and get a concise, validated summary in seconds.
            </CardDescription>
          </div>
          <ThemeToggle />
        </CardHeader>

        <CardContent className="space-y-5">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="document-upload" className="text-sm font-medium">
                Upload file
              </label>
              <input
                id="document-upload"
                type="file"
                accept=".txt,.csv,.docx"
                onChange={onFileUpload}
                disabled={isLoading || isUploading}
                className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="text-xs text-muted-foreground">
                Supports TXT, CSV, and DOCX uploads.
              </p>
            </div>
            <Textarea
              placeholder="Paste your document, report, notes, or RFC here..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-h-[220px]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <p>{inputStats.chars} characters</p>
              <p>~{inputStats.tokenEstimate} tokens</p>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || isUploading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Summarizing...
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing file...
                </>
              ) : (
                "Summarize Document"
              )}
            </Button>
          </form>

          <section className="space-y-2 rounded-xl border border-border/70 bg-background/50 p-4">
            <h2 className="text-sm font-medium">Summary</h2>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
            ) : summary ? (
              <p className="whitespace-pre-wrap text-sm leading-6">{summary}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your generated summary will appear here.
              </p>
            )}
          </section>
        </CardContent>
      </Card>
    </main>
  );
}

