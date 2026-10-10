"use client";

import * as React from "react";
import { Heart, House, Image as ImageIcon, Loader2, Send, Video } from "lucide-react";
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
  // Session 10 (R9-B): the reference's composer renders the author's 40px
  // initials avatar beside the textarea.
  const [userName, setUserName] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (!cancelled && json.ok) setUserName(json.data?.user?.name ?? "");
      } catch {
        /* the avatar falls back to the E mark */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8">
      {/* Session 10 (R9-B): the reference renders a narrow centered feed —
          max-w-3xl (768px) with space-y-6 rhythm, not the full-width
          1120px gap-8 layout. */}
      <div className="mx-auto flex w-full max-w-3xl flex-col space-y-6">
      <PageHeader
        section="Company Wall"
        layout="flat48"
        centered
        iconClassName="text-blue-600"
        sectionIcon={<House aria-hidden="true" />}
        title="Company Updates"
        subtitle="Stay connected with your team"
      />

      {/* composer — session 11 (R10-C) rebuilt to the measured reference
          recipe: CardContent p-6 > one `flex items-start gap-4` row
          wrapping the 40px initials avatar (sRGB-pinned gradient — trap 3;
          the reference's own bg-gradient-to-br renders sRGB in its v3
          engine, 16px/600 initials) beside a `flex-1 space-y-4` column
          (textarea min-h-[60px] rows=3 → 78px; space-y-2 label+select
          group; flex items-center justify-between action row). Every icon
          carries the reference's mr-2 (16px effective icon-text gap);
          Photo/Video = h-8 px-3 text-xs outline; Post = flat primary h-9
          with the leading Send icon. */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(to_bottom_right,#3b82f6,#6366f1)] text-base font-semibold text-white" aria-hidden="true">
              {(userName || "E").trim().charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 space-y-4">
              <Textarea
                aria-label="Share an update"
                placeholder="Share an update with your team..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={2000}
                rows={3}
                className="min-h-[60px]"
              />
              <div className="space-y-3">
                <Label className="block leading-5" htmlFor="post-audience">Who can see this post?</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger id="post-audience" className="w-full" aria-label="Audience">
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.toast({ title: "Attach coming soon", description: "Photo uploads land in a future update.", variant: "info" })}
                  >
                    <ImageIcon className="mr-2" aria-hidden="true" />
                    Photo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.toast({ title: "Attach coming soon", description: "Video uploads land in a future update.", variant: "info" })}
                  >
                    <Video className="mr-2" aria-hidden="true" />
                    Video
                  </Button>
                </div>
                <Button onClick={onPost} disabled={posting}>
                  {posting ? <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" /> : <Send className="mr-2" aria-hidden="true" />}
                  Post
                </Button>
              </div>
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
    </div>
  );
}
