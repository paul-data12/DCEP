import { prisma } from '@/lib/prisma';
import ExamClient from './ExamClient';
import { notFound } from 'next/navigation';

export default async function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Allow fetching by code or ID
  let exam = await prisma.exam.findFirst({
    where: { code: id }
  });

  if (!exam) {
    exam = await prisma.exam.findUnique({
      where: { id }
    });
  }

  if (!exam) {
    notFound();
  }

  return <ExamClient examId={exam.id} durationMinutes={exam.duration_minutes} examTitle={exam.title} />;
}
