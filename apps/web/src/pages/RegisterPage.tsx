import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Check } from "lucide-react";
import { useRegister } from "@/hooks/auth";
import { registerSchema } from "@/types/auth";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);

  const features = [
    "Automated company and contact research",
    "Products, pricing, competitors, and news extraction",
    "Real-time enrichment progress and status",
    "Reliable, failure-tolerant pipelines",
  ];

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const registerMutation = useRegister();

  const handleRegister = (e: React.SubmitEvent) => {
    e.preventDefault();

    const formData = {
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      password: form.password,
    };

    const parsed = registerSchema.safeParse(formData);

    if (!parsed.success) {
      alert(parsed.error.message);
      return;
    }

    registerMutation.mutate(parsed.data);
  };

  const openPopup = () => {
    window.open(
      "http://localhost:3000/api/auth/google/login",
      "popup",
      "width=500,height=600,menubar=no,toolbar=no,location=no,status=no",
    );
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div
        className="flex items-center justify-center p-6 sm:p-12
  bg-linear-to-br from-background to-muted/40"
      >
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <Link to="/" className="flex items-center gap-2">
              <img src={"/logo-full.svg"} alt={"Atlas logo"} title={"wat"} className="h-6" />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Create an account</h1>
            <p className="text-muted-foreground">Get started with your free account today</p>
          </div>

          <div className="space-y-3 mb-6">
            <Button
              onClick={openPopup}
              variant="outline"
              className="w-full h-12 justify-center gap-3"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background/80 backdrop-blur px-3 text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  className="h-12"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className="h-12"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                className="h-12"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="h-12 pr-10"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>

            <Button type="submit" className="w-full h-12">
              Create account
            </Button>
          </form>

          <p className="text-center mt-6 text-xs text-muted-foreground">
            By signing up, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>

      <div
        className="hidden lg:flex flex-col justify-center items-center p-12 relative overflow-hidden
  bg-linear-to-br from-black via-red-900 to-neutral-950"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <h1 className="text-4xl font-bold text-white mb-6">
            Start turning contacts into
            <br />
            business intelligence
          </h1>
          <ul className="space-y-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-white/80">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-red-400" />
                </div>

                {feature}
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="relative z-10" />
      </div>
    </div>
  );
};

export default Signup;
