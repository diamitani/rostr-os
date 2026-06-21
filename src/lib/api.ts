// ── Client-side API helper ──
// All DB access goes through Next.js API routes

class ApiClient {
  private async fetch(path: string, options?: RequestInit) {
    const res = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || "Request failed");
    }

    return res.json();
  }

  // Auth
  async signup(email: string, password: string, name: string) {
    return this.fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async me() {
    return this.fetch("/api/auth/me");
  }

  async signOut() {
    await this.fetch("/api/auth/logout", { method: "POST" });
  }

  // Projects
  async getProjects() {
    return this.fetch("/api/projects");
  }

  async getProject(id: string) {
    return this.fetch(`/api/projects/${id}`);
  }

  async createProject(data: { name: string; description: string; phase: string }) {
    return this.fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Tasks
  async getTasks(projectId?: string) {
    const qs = projectId ? `?project_id=${projectId}` : "";
    return this.fetch(`/api/tasks${qs}`);
  }

  async createTask(data: {
    project_id: string;
    title: string;
    npao_class: string;
    phase: string;
    description?: string;
    estimated_minutes?: number;
    done_when?: string;
  }) {
    return this.fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: Record<string, any>) {
    return this.fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
