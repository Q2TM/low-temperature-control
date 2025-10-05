import { Button } from "@repo/ui/base/button";

export default function Home() {
  return (
    <div>
      <main>
        <h1 className="text-3xl font-bold">Hello World</h1>
        <Button>This is button</Button>
        <Button variant="destructive">Destructive Button</Button>
        <Button variant="outline" size="lg">
          LG Outline Button
        </Button>
      </main>
    </div>
  );
}
