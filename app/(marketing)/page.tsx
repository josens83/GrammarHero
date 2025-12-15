import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Gamepad2, Target, Zap, Trophy, Flame, CheckCircle2, ArrowRight, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container text-center">
          <Badge variant="secondary" className="mb-4">AI-Powered Grammar Learning</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Master English Grammar<br />The Fun Way
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            GrammarHero uses AI to personalize your learning journey. Earn XP, maintain streaks, and compete with learners worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" asChild><Link href="/signup">Start Learning Free <ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
            <Button size="xl" variant="outline" asChild><Link href="/pricing">View Pricing</Link></Button>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">4.9</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /> Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Lessons</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose GrammarHero?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Learn grammar effectively with features designed to keep you motivated.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: "AI-Powered Learning", description: "Claude AI provides instant feedback and personalized explanations.", color: "text-purple-500" },
              { icon: Gamepad2, title: "Gamification", description: "Earn XP, unlock achievements, and climb the leaderboard.", color: "text-primary" },
              { icon: Target, title: "Daily Goals", description: "Set and achieve daily learning goals to build consistency.", color: "text-orange-500" },
            ].map((feature, i) => (
              <Card key={i} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className={`inline-flex p-3 rounded-full bg-muted mb-4`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Preview */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Learn Like Playing a Game</h2>
              <ul className="space-y-4">
                {[
                  { icon: Zap, text: "Earn XP for every lesson completed", color: "text-primary" },
                  { icon: Flame, text: "Build streaks to stay motivated", color: "text-orange-500" },
                  { icon: Trophy, text: "Compete on global leaderboards", color: "text-yellow-500" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background shadow-sm">
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <span className="text-lg">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8">
              <div className="bg-background rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Level 12</span>
                  <span className="text-sm text-muted-foreground">850 / 1000 XP</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary w-[85%]" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg"><Zap className="h-6 w-6 text-primary mx-auto mb-1" /><span className="text-sm font-medium">2,450 XP</span></div>
                  <div className="text-center p-3 bg-muted rounded-lg"><Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" /><span className="text-sm font-medium">15 Days</span></div>
                  <div className="text-center p-3 bg-muted rounded-lg"><Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-1" /><span className="text-sm font-medium">#42</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Master English Grammar?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">Join thousands of learners improving their grammar skills every day.</p>
          <Button size="xl" variant="secondary" asChild><Link href="/signup">Start Learning Free</Link></Button>
        </div>
      </section>
    </div>
  );
}
