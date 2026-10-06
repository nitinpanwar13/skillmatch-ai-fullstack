import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "./lib/api";

const demoJobs = [
  {
    _id: "demo-1",
    title: "React Developer",
    company: "Tech Solutions",
    location: "Delhi",
    skills: ["React", "JavaScript", "CSS"],
  },
  {
    _id: "demo-2",
    title: "Node.js Developer",
    company: "Code Labs",
    location: "Gurgaon",
    skills: ["Node.js", "Express", "MongoDB"],
  },
  {
    _id: "demo-3",
    title: "Full Stack Developer",
    company: "Digital India",
    location: "Noida",
    skills: ["React", "Node.js", "MongoDB"],
  },
];

function Nav({ user, onLogout }) {
  return (
    <nav className="nav">
      <Link to="/" className="brand">
        SkillMatch AI
      </Link>

      <div className="navlinks">
        <Link to="/jobs">Jobs</Link>

        {user && <Link to="/applications">Applications</Link>}

        {user && <Link to="/profile">Profile</Link>}

        {user ? (
          <button className="linkbtn" onClick={onLogout}>
            Logout
          </button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

function Home() {
  return (
    <section className="hero">
      <div>
        <span className="eyebrow">AI-powered career intelligence</span>

        <h1>Find jobs that fit your skills.</h1>

        <p>
          Search jobs, save opportunities, track applications and see where
          your skills match the role.
        </p>

        <Link className="primary" to="/jobs">
          Explore Jobs
        </Link>
      </div>
    </section>
  );
}

function Jobs() {
  const [jobs, setJobs] = useState(demoJobs);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    api("/jobs")
      .then((response) => {
        setJobs(response.jobs);
      })
      .catch(() => {
        setJobs(demoJobs);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const visible = jobs.filter((job) =>
    `${job.title} ${job.company} ${job.location}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <section className="page">
      <div className="row between">
        <div>
          <h2>Job marketplace</h2>

          <p className="muted">
            Search and compare opportunities.
          </p>
        </div>

        <input
          className="input small"
          placeholder="Search title, company, location"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid">
          {visible.map((job) => (
            <article
              className="card"
              key={job._id}
            >
              <h3>{job.title}</h3>

              <p className="muted">
                {job.company} · {job.location}
              </p>

              <div className="chips">
                {job.skills?.map((skill) => (
                  <span
                    className="chip"
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <Link
                className="secondary"
                to={`/jobs/${job._id}`}
              >
                View details
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function JobDetails({ user }) {
  const { pathname } = window.location;

  const id = pathname.split("/").pop();

  const [job, setJob] = useState(
    demoJobs.find((job) => job._id === id)
  );

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id.startsWith("demo-")) {
      api(`/jobs/${id}`)
        .then((response) => setJob(response.job))
        .catch((error) => setMessage(error.message));
    }
  }, [id]);

  if (!job) {
    return (
      <section className="page">
        <p>{message || "Job not found"}</p>
      </section>
    );
  }

  const apply = async () => {
    if (!user) {
      return setMessage("Login first to apply.");
    }

    try {
      await api("/applications", {
        method: "POST",
        body: JSON.stringify({
          jobId: job._id,
        }),
      });

      setMessage("Application submitted.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="page">
      <div className="card wide">
        <h2>{job.title}</h2>

        <p className="muted">
          {job.company} · {job.location}
        </p>

        <p>
          {job.description ||
            "Build modern products with a collaborative engineering team."}
        </p>

        <div className="chips">
          {job.skills?.map((skill) => (
            <span className="chip" key={skill}>
              {skill}
            </span>
          ))}
        </div>

        <button className="primary" onClick={apply}>
          Apply Now
        </button>

        {message && (
          <p className="notice">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}

function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: "demo@example.com",
    password: "Password123",
  });

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    try {
      const response = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      onLogin(response.user);
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <section className="page narrow">
      <form className="card form" onSubmit={submit}>
        <h2>Login</h2>

        <input
          className="input"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
          placeholder="Email"
        />

        <input
          className="input"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
          placeholder="Password"
          type="password"
        />

        <button className="primary">
          Login
        </button>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <p className="muted">
          Create a user through the Register API or use the
          demo seed instructions in README.
        </p>
      </form>
    </section>
  );
}

function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    skills: "",
    education: "",
    experience: "",
    resume: {
      name: "",
      url: "",
    },
  });

  const [message, setMessage] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    api("/profile")
      .then((response) => {
        const data = response.profile;

        setProfile({
          name: data?.name || "",
          email: data?.email || "",
          skills: Array.isArray(data?.skills)
            ? data.skills.join(", ")
            : data?.skills || "",
          education: data?.education || "",
          experience: data?.experience || "",
          resume: data?.resume || {
            name: "",
            url: "",
          },
        });
      })
      .catch((error) => {
        setMessage(error.message);
      });
  }, []);

  const save = async (e) => {
    e.preventDefault();

    try {
      const response = await api("/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: profile.name,
          skills: profile.skills,
          education: profile.education,
          experience: profile.experience,
        }),
      });

      const data = response.profile;

      setProfile((current) => ({
        ...current,
        name: data?.name || current.name,
        email: data?.email || current.email,
        skills: Array.isArray(data?.skills)
          ? data.skills.join(", ")
          : current.skills,
        education: data?.education || current.education,
        experience: data?.experience || current.experience,
        resume: data?.resume || current.resume,
      }));

      setMessage("Profile saved.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const uploadResume = async () => {
    if (!resumeFile) {
      setMessage("Please select a PDF resume.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("resume", resumeFile);

      const response = await api("/profile/resume", {
        method: "POST",
        body: formData,
      });

      setProfile((current) => ({
        ...current,
        resume: response.profile.resume,
      }));

      setResumeFile(null);
      setMessage("Resume uploaded successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="page narrow">
      <form className="card form" onSubmit={save}>
        <h2>Career Profile</h2>

        <input
          className="input"
          placeholder="Name"
          value={profile.name}
          onChange={(e) =>
            setProfile({
              ...profile,
              name: e.target.value,
            })
          }
        />

        <input
          className="input"
          placeholder="Email"
          value={profile.email}
          readOnly
        />

        <input
          className="input"
          placeholder="Skills"
          value={profile.skills}
          onChange={(e) =>
            setProfile({
              ...profile,
              skills: e.target.value,
            })
          }
        />

        <input
          className="input"
          placeholder="Education"
          value={profile.education}
          onChange={(e) =>
            setProfile({
              ...profile,
              education: e.target.value,
            })
          }
        />

        <input
          className="input"
          placeholder="Experience"
          value={profile.experience}
          onChange={(e) =>
            setProfile({
              ...profile,
              experience: e.target.value,
            })
          }
        />

        <button className="primary">
          Save Profile
        </button>

        <hr />

        <h3>Resume</h3>

        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) =>
            setResumeFile(e.target.files?.[0] || null)
          }
        />

        <button
          type="button"
          className="secondary"
          onClick={uploadResume}
        >
          Upload Resume
        </button>

        {profile.resume?.url && (
          <a
            href={`http://localhost:5000${profile.resume.url}`}
            target="_blank"
            rel="noreferrer"
          >
            View uploaded resume
          </a>
        )}

        {message && (
          <p className="notice">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}

function Applications() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api("/applications")
      .then((response) =>
        setItems(response.applications)
      )
      .catch(() => {});
  }, []);

  return (
    <section className="page">
      <h2>My Applications</h2>

      <div className="grid">
        {items.map((application) => (
          <article
            className="card"
            key={application._id}
          >
            <h3>
              {application.job?.title ||
                application.jobId}
            </h3>

            <p>
              {application.job?.company}
            </p>

            <span className="chip">
              {application.status}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setMessage(
        "Registered. You can now login."
      );
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="page narrow">
      <form
        className="card form"
        onSubmit={submit}
      >
        <h2>Create account</h2>

        {["name", "email", "password"].map(
          (key) => (
            <input
              key={key}
              className="input"
              type={
                key === "password"
                  ? "password"
                  : "text"
              }
              placeholder={key}
              value={form[key]}
              onChange={(e) =>
                setForm({
                  ...form,
                  [key]: e.target.value,
                })
              }
            />
          )
        )}

        <button className="primary">
          Register
        </button>

        {message && (
          <p className="notice">
            {message}
          </p>
        )}

        <button
          type="button"
          className="linkbtn"
          onClick={() => navigate("/login")}
        >
          Go to login
        </button>
      </form>
    </section>
  );
}

export default function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(
      localStorage.getItem("user") || "null"
    )
  );

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <>
      <Nav
        user={user}
        onLogout={logout}
      />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/jobs"
          element={<Jobs />}
        />

        <Route
          path="/jobs/:id"
          element={<JobDetails user={user} />}
        />

        <Route
          path="/applications"
          element={<Applications />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/login"
          element={<Login onLogin={setUser} />}
        />

        <Route
          path="/register"
          element={<Register />}
        />
      </Routes>
    </>
  );
}