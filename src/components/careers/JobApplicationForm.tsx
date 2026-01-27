import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Upload, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ScrollReveal from "@/components/animations/ScrollReveal";

const applicationSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(20),
  position: z.string().min(1, "Please select a position"),
  experience: z.string().trim().min(10, "Please describe your experience").max(1000),
  coverLetter: z.string().trim().min(50, "Cover letter must be at least 50 characters").max(2000),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const positions = [
  "Lead Preschool Teacher",
  "Assistant Teacher",
  "Music & Movement Instructor",
  "Administrative Coordinator",
  "General Application",
];

const JobApplicationForm = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      if (!["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        });
        return;
      }
      setResumeFile(file);
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    
    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log("Application submitted:", { ...data, resume: resumeFile?.name });
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Application Submitted!",
      description: "Thank you for your interest. We'll review your application and get back to you soon.",
    });
    
    reset();
    setResumeFile(null);
  };

  if (isSubmitted) {
    return (
      <ScrollReveal>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 bg-mint/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-mint" />
            </motion.div>
            <h3 className="font-display font-bold text-2xl text-foreground mb-3">
              Application Received!
            </h3>
            <p className="text-muted-foreground mb-6">
              Thank you for applying to join Little Stars Kindergarten. Our team will review your application and contact you within 5-7 business days.
            </p>
            <Button variant="outline" onClick={() => setIsSubmitted(false)}>
              Submit Another Application
            </Button>
          </CardContent>
        </Card>
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-center">
            Apply to Join Our Team
          </CardTitle>
          <p className="text-muted-foreground text-center">
            Fill out the form below and attach your resume
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  {...register("fullName")}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  {...register("phone")}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Select onValueChange={(value) => setValue("position", value)}>
                  <SelectTrigger className={errors.position ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.position && (
                  <p className="text-sm text-destructive">{errors.position.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Relevant Experience *</Label>
              <Textarea
                id="experience"
                placeholder="Briefly describe your experience working with children..."
                rows={3}
                {...register("experience")}
                className={errors.experience ? "border-destructive" : ""}
              />
              {errors.experience && (
                <p className="text-sm text-destructive">{errors.experience.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter *</Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell us why you'd be a great fit for our team..."
                rows={5}
                {...register("coverLetter")}
                className={errors.coverLetter ? "border-destructive" : ""}
              />
              {errors.coverLetter && (
                <p className="text-sm text-destructive">{errors.coverLetter.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Resume (PDF or Word)</Label>
              <div className="relative">
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="resume"
                  className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {resumeFile ? (
                    <>
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-foreground">{resumeFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Click to upload your resume (max 5MB)
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="playful"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </ScrollReveal>
  );
};

export default JobApplicationForm;
