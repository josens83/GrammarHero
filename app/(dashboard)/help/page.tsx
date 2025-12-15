/**
 * @fileoverview Help/FAQ Page
 * @description Comprehensive help center with FAQ, tutorials, and support
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  HelpCircle,
  Search,
  Book,
  Zap,
  Flame,
  Trophy,
  Heart,
  Crown,
  MessageCircle,
  Mail,
  ExternalLink,
  ChevronRight,
  PlayCircle,
  FileText,
  Shield,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

const FAQ_CATEGORIES = [
  {
    id: "getting-started",
    name: "Getting Started",
    icon: Book,
    faqs: [
      {
        q: "How do I start learning with GrammarHero?",
        a: "After signing up, head to the Learn page where you'll find grammar lessons organized by category and difficulty. Start with beginner lessons and work your way up. Each lesson contains interactive exercises to help you master the concepts.",
      },
      {
        q: "What grammar topics are covered?",
        a: "GrammarHero covers a wide range of English grammar topics including tenses, articles, prepositions, conditionals, modal verbs, passive voice, reported speech, and much more. New lessons are added regularly.",
      },
      {
        q: "How long does each lesson take?",
        a: "Most lessons take 5-10 minutes to complete. You can see the estimated time for each lesson before starting. Feel free to take breaks and resume where you left off.",
      },
    ],
  },
  {
    id: "xp-levels",
    name: "XP & Levels",
    icon: Zap,
    faqs: [
      {
        q: "How do I earn XP?",
        a: "You earn XP by completing lessons, daily challenges, and review sessions. The amount of XP depends on your performance - answering correctly earns more XP. Maintaining streaks also gives bonus XP!",
      },
      {
        q: "What happens when I level up?",
        a: "Leveling up unlocks new achievements and shows your progress. Higher levels demonstrate your dedication to learning English grammar. You'll see a celebration animation when you reach a new level!",
      },
      {
        q: "How is my level calculated?",
        a: "Your level is based on your total XP. Each level requires progressively more XP to reach. You can see your progress toward the next level on your dashboard and profile.",
      },
    ],
  },
  {
    id: "streaks",
    name: "Streaks",
    icon: Flame,
    faqs: [
      {
        q: "What is a streak?",
        a: "A streak tracks consecutive days of learning. Complete at least one lesson each day to maintain your streak. Streaks motivate daily practice and help build lasting learning habits.",
      },
      {
        q: "How do I protect my streak?",
        a: "Free users can earn Streak Freezes through achievements. Pro users get unlimited streak protection. A Streak Freeze automatically protects your streak if you miss a day.",
      },
      {
        q: "What time does my streak reset?",
        a: "Your streak day resets at midnight in your local timezone. Make sure to complete at least one lesson before midnight to maintain your streak!",
      },
    ],
  },
  {
    id: "hearts",
    name: "Hearts System",
    icon: Heart,
    faqs: [
      {
        q: "What are hearts?",
        a: "Hearts represent your learning lives. Free users start with 5 hearts and lose one for each incorrect answer. When you run out of hearts, you need to wait for them to refill or watch your mistakes to earn hearts back.",
      },
      {
        q: "How do hearts refill?",
        a: "Hearts automatically refill over time - one heart every 4 hours. You can also practice previous lessons to earn hearts back, or upgrade to Pro for unlimited hearts.",
      },
      {
        q: "Do Pro users have unlimited hearts?",
        a: "Yes! Pro subscribers enjoy unlimited hearts, so you can learn without interruption even when making mistakes. Mistakes are part of learning!",
      },
    ],
  },
  {
    id: "subscription",
    name: "Subscription",
    icon: Crown,
    faqs: [
      {
        q: "What's included in GrammarHero Pro?",
        a: "Pro includes unlimited hearts, all grammar lessons, AI-powered grammar checking, streak protection, advanced analytics, and ad-free experience. It's the best way to maximize your learning.",
      },
      {
        q: "Can I cancel my subscription anytime?",
        a: "Yes, you can cancel your subscription at any time from your account settings. You'll continue to have Pro access until the end of your billing period.",
      },
      {
        q: "Is there a free trial?",
        a: "Yes! New users get a 7-day free trial of Pro features. You can explore all premium features before deciding to subscribe.",
      },
    ],
  },
  {
    id: "account",
    name: "Account & Privacy",
    icon: Shield,
    faqs: [
      {
        q: "How do I reset my password?",
        a: "Click 'Forgot Password' on the login page and enter your email. You'll receive a link to reset your password. Make sure to check your spam folder if you don't see the email.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes, you can delete your account from Settings > Privacy & Data. This action is permanent and will remove all your data including progress, achievements, and subscription.",
      },
      {
        q: "How is my data protected?",
        a: "We use industry-standard encryption and security practices. Your data is never sold to third parties. Read our Privacy Policy for complete details on how we handle your information.",
      },
    ],
  },
];

const QUICK_LINKS = [
  { title: "Video Tutorials", icon: PlayCircle, href: "#tutorials" },
  { title: "Terms of Service", icon: FileText, href: "/terms" },
  { title: "Privacy Policy", icon: Shield, href: "/privacy" },
  { title: "Billing FAQ", icon: CreditCard, href: "#billing" },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const { toast } = useToast();

  const filteredFAQs = FAQ_CATEGORIES.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.faqs.length > 0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to support
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24-48 hours.",
    });
    setContactName("");
    setContactEmail("");
    setContactMessage("");
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <HelpCircle className="h-10 w-10 text-primary" />
          Help Center
        </h1>
        <p className="text-muted-foreground text-lg">
          Find answers to common questions or contact our support team
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {QUICK_LINKS.map((link) => (
          <Link key={link.title} href={link.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <link.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{link.title}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="faq">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="contact">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Us
          </TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          {searchQuery && filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  Try different keywords or contact support for help.
                </p>
              </CardContent>
            </Card>
          ) : (
            (searchQuery ? filteredFAQs : FAQ_CATEGORIES).map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <category.icon className="h-6 w-6 text-primary" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Send us a message
                </CardTitle>
                <CardDescription>
                  We typically respond within 24-48 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="How can we help you?"
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Other ways to reach us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        support@grammarhero.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Live Chat</p>
                      <p className="text-sm text-muted-foreground">
                        Available Mon-Fri, 9am-5pm EST
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Community</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <Link href="#">
                      Discord Community
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <Link href="#">
                      Twitter @GrammarHero
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Crown className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Pro Support</p>
                      <p className="text-sm text-muted-foreground">
                        Pro subscribers get priority support with faster response times.
                      </p>
                      <Button variant="link" className="h-auto p-0 mt-2" asChild>
                        <Link href="/pricing">Upgrade to Pro</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
