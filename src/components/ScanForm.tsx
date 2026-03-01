import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, ScanSearch, FileWarning } from 'lucide-react';

interface ScanFormProps {
  onScan: (data: { type: 'file'; file: File } | { type: 'url'; url: string }) => void;
  isScanning: boolean;
}

export function ScanForm({ onScan, isScanning }: ScanFormProps) {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleFileScan = () => {
    if (file) onScan({ type: 'file', file });
  };

  const handleUrlScan = () => {
    if (url.trim()) onScan({ type: 'url', url: url.trim() });
  };

  return (
    <Card className="p-6 bg-card border-border">
      <Tabs defaultValue="file">
        <TabsList className="bg-secondary mb-6">
          <TabsTrigger value="file" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Upload className="w-4 h-4" /> File Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Link className="w-4 h-4" /> URL Scan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-all cursor-pointer ${
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
            }`}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept=".exe,.pdf,.docx,.zip,.js,.bat,.cmd,.msi,.ps1,.vbs,.apk,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileWarning className="w-10 h-10 text-warning" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 text-muted-foreground" />
                <p className="text-muted-foreground">Drop a file here or click to browse</p>
                <p className="text-xs text-muted-foreground">.exe, .pdf, .docx, .zip, .js, .apk, .jpg, .jpeg supported</p>
              </div>
            )}
          </div>
          <Button
            onClick={handleFileScan}
            disabled={!file || isScanning}
            className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            {isScanning ? (
              <><span className="scan-pulse">⟳</span> Analyzing...</>
            ) : (
              <><ScanSearch className="w-4 h-4" /> Analyze File</>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="url">
          <div className="space-y-4">
            <Input
              placeholder="https://suspicious-site.example.com/login"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button
              onClick={handleUrlScan}
              disabled={!url.trim() || isScanning}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              {isScanning ? (
                <><span className="scan-pulse">⟳</span> Scanning...</>
              ) : (
                <><ScanSearch className="w-4 h-4" /> Scan URL</>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
