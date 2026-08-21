import { ServiceGrid } from "@/components/ServiceGrid";
const items = [
  { name: "VS Code", href: "https://vscode.dev", desc: "Browser VS Code", tag: "Editor" },
  { name: "CodeSandbox", href: "https://codesandbox.io", desc: "Online sandbox", tag: "Dev" },
  { name: "StackBlitz", href: "https://stackblitz.com", desc: "WebContainers IDE", tag: "Dev" },
  { name: "Postman", href: "https://www.postman.com", desc: "API testing", tag: "API" },
  { name: "Hoppscotch", href: "https://hoppscotch.io", desc: "Open-source API client", tag: "API" },
  { name: "Notion", href: "https://www.notion.so", desc: "Docs & wikis", tag: "Docs" },
  { name: "Trello", href: "https://trello.com", desc: "Boards & tasks", tag: "PM" },
  { name: "Cursor", href: "https://cursor.com", desc: "AI code editor", tag: "AI" }
];
export default function DeveloperPage() {
  return (
    <div className="space-y-4 max-w-5xl">
      <h1 className="text-xl font-bold text-white">Developer & Productivity</h1>
      <ServiceGrid items={items} />
    </div>
  );
}
