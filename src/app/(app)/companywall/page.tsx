"use client";

import * as React from "react";
import { Heart, Image as ImageIcon, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ui/toast";
import { cn, initials, timeAgo } from "@/lib/utils";

interface PostAuthor {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

interface PostItem {
  id: string;
  content: string;
  audience: string;
  likes: number;
  createdAt: string;
  author: PostAuthor;
}

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All Employees" },
  { value: "managers", label: "Managers Only" },
  { value: "department", label: "My Department" },
];

const AUDIENCE_LABEL: Record<string, string> = {
  all: "All Employees",
  managers: "Managers Only",
  department: "My Department",
};

export default function CompanyWallPage() {
  const toast = useToast();
  const [posts, setPosts] = React.useState<PostItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [content, setContent] = React.useState("");
  const [audience, setAudience] = React.useState("all");
  const [posting, setPosting] = React.useState(false);
  const [likedIds, setLikedIds] = React.useState<Set<string>>(new Set());

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      const json = await res.json();
      if (json.ok) setPosts(json.data.posts);
      else toast.toast({ title: "Failed to load posts", description: json.error?.message, variant: "error" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onPost() {
    const trimmed = content.trim();
    if (!trimmed) {
      toast.toast({ title: "Nothing to share", description: "Write something before posting.", variant: "info" });
      return;
    }
    setPosting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, audience }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Post failed", description: json.error?.message, variant: "error" });
        return;
      }
      setPosts((prev) => [json.data.post, ...prev]);
      setContent("");
      toast.toast({ title: "Posted", description: "Your update is live on the wall.", variant: "success" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setPosting(false);
    }
  }

  function onToggleLike(post: PostItem) {
    const liked = likedIds.has(post.id);
    const nextLiked = !liked;
    // optimistic update
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (nextLiked) next.add(post.id);
      else next.delete(post.id);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, likes: Math.max(0, p.likes + (nextLiked ? 1 : -1)) } : p))
    );
    void (async () => {
      try {
        const res = await fetch(`/api/posts?id=${post.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ liked: nextLiked }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error?.message ?? "failed");
        setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, likes: json.data.likes } : p)));
      } catch {
        // revert
        setLikedIds((prev) => {
          const next = new Set(prev);
          if (nextLiked) next.delete(post.id);
          else next.add(post.id);
          return next;
        });
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, likes: Math.max(0, p.likes + (liked ? 1 : -1)) } : p))
        );
        toast.toast({ title: "Could not update like", variant: "error" });
      }
    })();
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Company Wall"
        title="Company Updates"
        subtitle="Stay connected with your team"
      />

      {/* composer */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-content">Share an update</Label>
            <Textarea
              id="post-content"
              placeholder="What's happening in your team?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              className="min-h-[88px]"
            />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="post-audience">Who can see this post?</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger id="post-audience" className="w-full sm:w-52" aria-label="Audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.toast({ title: "Attach coming soon", description: "Photo uploads land in a future update.", variant: "info" })}
              >
                <ImageIcon aria-hidden="true" />
                Photo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.toast({ title: "Attach coming soon", description: "Video uploads land in a future update.", variant: "info" })}
              >
                <Video aria-hidden="true" />
                Video
              </Button>
              <Button size="sm" onClick={onPost} disabled={posting}>
                {posting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* feed */}
      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <EmptyState
            title="No posts yet"
            description="Be the first to share something with your team!"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => {
            const liked = likedIds.has(post.id);
            return (
              <Card key={post.id}>
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {post.author.avatarUrl ? (
                          <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                        ) : null}
                        <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{post.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(post.createdAt)} · {AUDIENCE_LABEL[post.audience] ?? post.audience}
                        </p>
                      </div>
                    </div>
                    {post.audience !== "all" ? <Badge variant="secondary">{AUDIENCE_LABEL[post.audience]}</Badge> : null}
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-foreground">{post.content}</p>
                  <div className="flex items-center gap-1 border-t pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleLike(post)}
                      className={cn("gap-1.5", liked && "text-red-600 hover:text-red-700")}
                      aria-label={liked ? "Unlike post" : "Like post"}
                    >
                      <Heart className={cn("h-4 w-4", liked && "fill-current")} aria-hidden="true" />
                      {post.likes}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
