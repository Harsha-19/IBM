import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateLecture, useProcessLecture } from '@/hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Brain,
} from 'lucide-react';

export function NewLecturePage() {
  const navigate = useNavigate();
  const createMutation = useCreateLecture();
  const processMutation = useProcessLecture();

  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [processingStep, setProcessingStep] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const steps = [
    'Uploading content & validating document',
    'Extracting text & segmenting lecture sections',
    'AI identifying key concepts & knowledge taxonomy',
    'Generating conceptual & application questions',
    'Running quality-gate validator & distractor audit',
    'Quiz finalized & ready for learning',
  ];

  const sampleMLText = `Machine Learning (ML) is a subfield of artificial intelligence focused on building algorithms that learn patterns from data. 
There are three main paradigms:
1. Supervised Learning: Uses labeled training data where each example includes inputs and target outputs. Common tasks include regression and classification.
2. Unsupervised Learning: Discovers intrinsic structure and patterns within unlabeled datasets. Key algorithms include K-Means clustering and Principal Component Analysis (PCA).
3. Reinforcement Learning: Trains autonomous agents via trial and error, using rewards and penalties to maximize cumulative payoff over time.

K-Means Clustering partitions n observations into k clusters where each observation belongs to the cluster with the nearest mean (centroid).
Distance metrics like Euclidean distance and Manhattan distance heavily dictate how points are assigned to clusters. Centroid updates repeat iteratively until convergence.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please provide a lecture title.');
      return;
    }
    if (mode === 'text' && !content.trim()) {
      setErrorMsg('Please paste or write lecture content/transcript.');
      return;
    }
    if (mode === 'file' && !file) {
      setErrorMsg('Please select a PDF, DOCX, or TXT file to upload.');
      return;
    }

    try {
      setErrorMsg(null);
      setIsProcessing(true);
      setProcessingStep(1); // Uploading

      // 1. Create lecture
      const lecture = await createMutation.mutateAsync({
        title,
        source_type: mode === 'file' ? (file?.name.split('.').pop() || 'file') : 'text',
        content: mode === 'text' ? content : undefined,
        file: mode === 'file' && file ? file : undefined,
      });

      // 2. Animate pipeline progress
      setProcessingStep(2);
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep(3);

      // 3. Process lecture on backend (concepts, questions, validation)
      await processMutation.mutateAsync(lecture.id);

      setProcessingStep(4);
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep(5);
      await new Promise((r) => setTimeout(r, 500));

      // Done! Redirect
      navigate(`/lectures/${lecture.id}`);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.response?.data?.detail || 'An error occurred while uploading and processing the lecture.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text">Ingest New Lecture</h1>
        <p className="text-sm text-text-secondary mt-1">
          Provide notes, transcripts, or slides. The system will extract concepts, synthesize questions, and run the quality validation gate.
        </p>
      </div>

      {isProcessing ? (
        <Card className="p-8 bg-white border border-border text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8 animate-pulse text-primary" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-text">Processing Your Lecture</h2>
            <p className="text-sm text-text-secondary mt-1">
              Please wait while our AI & validation pipeline prepares your adaptive quiz.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <ProgressBar value={(processingStep / (steps.length - 1)) * 100} className="h-2.5" />
          </div>

          {/* Stepper Display */}
          <div className="space-y-3 text-left max-w-md mx-auto pt-2">
            {steps.map((s, index) => {
              const isPast = index < processingStep;
              const isCurrent = index === processingStep;
              return (
                <div key={index} className="flex items-center gap-3 text-xs">
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                  )}
                  <span
                    className={
                      isCurrent
                        ? 'font-semibold text-primary'
                        : isPast
                        ? 'text-text font-medium'
                        : 'text-text-secondary'
                    }
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-white border border-border shadow-sm">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Lecture Title *"
              placeholder="e.g. Introduction to Machine Learning - Lecture 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Optional Course / Lecture Description
              </label>
              <input
                type="text"
                placeholder="e.g. Stanford CS229 Week 1 Overview"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Input Mode Selector */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Input Source *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('text')}
                  className={`p-3.5 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition ${
                    mode === 'text'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-white text-text-secondary hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Pasted Text / Transcript
                </button>
                <button
                  type="button"
                  onClick={() => setMode('file')}
                  className={`p-3.5 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition ${
                    mode === 'file'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-white text-text-secondary hover:bg-gray-50'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" /> Upload File (PDF, DOCX, TXT)
                </button>
              </div>
            </div>

            {mode === 'text' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text">Lecture Transcript / Content *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setTitle('Introduction to Machine Learning');
                      setContent(sampleMLText);
                    }}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Fill Sample Lecture Text
                  </button>
                </div>
                <textarea
                  rows={9}
                  placeholder="Paste lecture transcript, summary, or notes here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 border border-border rounded-lg text-sm bg-white font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text">Upload Document *</label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition bg-gray-50/50">
                  <UploadCloud className="w-10 h-10 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-text">
                    {file ? file.name : 'Click to select or drag and drop a file'}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Supports PDF, DOCX, TXT up to 10MB
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                        if (!title) {
                          setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                        }
                      }
                    }}
                    className="mt-4 text-xs mx-auto block"
                  />
                </div>
              </div>
            )}

            {/* Quality Principle Notice */}
            <div className="p-3.5 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Quality Gating:</strong> All generated questions are checked for lecture grounding, factual correctness, distractor quality, and clarity before entering your quiz.
              </span>
            </div>

            <Button type="submit" className="w-full gap-2">
              Ingest & Start Processing Pipeline <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
