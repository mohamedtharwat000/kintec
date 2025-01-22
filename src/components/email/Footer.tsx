export function Footer() {
  return (
    <footer className="border-t py-4">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            © 2024 Critical Future. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
            <span>Version 1.0.0</span>
            <span>•</span>
            <span>Made with ❤️</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
