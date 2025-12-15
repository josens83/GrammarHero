"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageLoader, ButtonLoader } from "@/components/common/LoadingSpinner";
import { PenTool, Sparkles, Crown, CheckCircle2, XCircle, Lightbulb, RefreshCw } from "lucide-react";

interface GrammarIssue {
  original: string;
  correction: string;
  explanation: string;
  type: string;
}

export default function PracticePage() {
  const { user, isLoading } = useUser();
  const [text, setText] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{ issues: GrammarIssue[]; score: number } | null>(null);

  if (isLoading) return <PageLoader />;

  const isPro = user?.subscriptionTier !== "free";

  const handleCheck = async () => {
    if (!text.trim()) return;
    setIsChecking(true);

    // Demo response - in production this would call the AI API
    await new Promise(resolve => setTimeout(resolve, 1500));

    setResult({
      score: 75,
      issues: [
        { original: "He don't", correction: "He doesn't", explanation: "Use 'doesn't' with third person singular (he/she/it).", type: "Subject-Verb Agreement" },
        { original: "me and him", correction: "he and I", explanation: "Use subject pronouns (I, he) as the subject of a sentence.", type: "Pronoun Case" },
      ],
    });
    setIsChecking(false);
  };

  const handleReset = () => {
    setText("");
    setResult(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><PenTool className="h-8 w-8" />Practice Writing</h1>
        <p className="text-muted-foreground">Get AI-powered feedback on your grammar</p>
      </div>

      {!isPro && (
        <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-secondary" />
              <div>
                <p className="font-semibold">Upgrade to Pro</p>
                <p className="text-sm text-muted-foreground">Get unlimited AI grammar checks</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">Upgrade</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" />AI Grammar Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea placeholder="Write or paste your text here to check for grammar errors..." value={text} onChange={(e) => setText(e.target.value)} className="min-h-[200px]" disabled={!isPro} />

          <div className="flex gap-2">
            <Button onClick={handleCheck} disabled={!text.trim() || isChecking || !isPro} className="flex-1">
              {isChecking ? <><ButtonLoader /> Checking...</> : <><Sparkles className="mr-2 h-4 w-4" />Check Grammar</>}
            </Button>
            {result && <Button variant="outline" onClick={handleReset}><RefreshCw className="h-4 w-4" /></Button>}
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Results</span>
              <Badge variant={result.score >= 80 ? "success" : result.score >= 60 ? "warning" : "destructive"}>{result.score}% Score</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.issues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-lg font-semibold">Perfect! No grammar issues found.</p>
              </div>
            ) : (
              result.issues.map((issue, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{issue.type}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="line-through text-destructive">{issue.original}</span>
                    <span className="text-primary font-medium">{issue.correction}</span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" />{issue.explanation}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Practice Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Describe your daily routine",
              "Write about your favorite hobby",
              "Explain how to make your favorite food",
              "Describe a memorable vacation",
            ].map((prompt, i) => (
              <Button key={i} variant="outline" className="justify-start h-auto py-3" onClick={() => isPro && setText(`${prompt}:\n\n`)} disabled={!isPro}>
                <PenTool className="mr-2 h-4 w-4 shrink-0" />{prompt}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
