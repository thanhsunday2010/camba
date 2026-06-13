import Link from "next/link";
import { notFound } from "next/navigation";
import { ExamLevel } from "@prisma/client";
import { db } from "@/lib/db";
import { formatExamLevel, formatSkill, SKILLS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Headphones, Mic, PenLine, Languages } from "lucide-react";

const skillIcons: Record<string, typeof BookOpen> = {
  READING: BookOpen,
  WRITING: PenLine,
  LISTENING: Headphones,
  SPEAKING: Mic,
  USE_OF_ENGLISH: Languages,
};

export default async function ExamsLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const validLevels = ["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"];
  if (!validLevels.includes(level)) notFound();

  const papers = await db.examPaper.findMany({
    where: { level: level as ExamLevel, published: true },
    orderBy: [{ skill: "asc" }, { title: "asc" }],
  });

  const grouped = SKILLS.map((skill) => ({
    skill,
    papers: papers.filter((p) => p.skill === skill.value),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{formatExamLevel(level)}</h1>
        <p className="text-muted-foreground">Chọn kỹ năng và bộ đề để luyện tập</p>
      </div>

      <div className="space-y-10">
        {grouped.map(({ skill, papers: skillPapers }) => {
          const Icon = skillIcons[skill.value] ?? BookOpen;
          return (
            <section key={skill.value}>
              <div className="mb-4 flex items-center gap-2">
                <Icon className="h-5 w-5 text-cambridge-600" />
                <h2 className="text-xl font-semibold">{skill.label}</h2>
              </div>

              {skillPapers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có đề cho kỹ năng này.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {skillPapers.map((paper) => (
                    <Link key={paper.id} href={`/practice/${paper.id}`}>
                      <Card className="h-full transition-shadow hover:shadow-md">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg">{paper.title}</CardTitle>
                            {paper.isMockTest && (
                              <Badge variant="secondary">Mock test</Badge>
                            )}
                          </div>
                          {paper.description && (
                            <CardDescription>{paper.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {paper.timeLimit && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {Math.floor(paper.timeLimit / 60)} phút
                              </span>
                            )}
                            <span>{formatSkill(paper.skill)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
