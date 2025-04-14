import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export const DemoWidget = () => {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>Try It Out</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="feedback">Sample Feedback</Label>
            <Textarea 
              id="feedback"
              className="min-h-24"
              placeholder="Paste user feedback here..."
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="code">Generated Code</Label>
            <div className="p-3 bg-slate-900 text-slate-100 rounded-lg text-sm h-24 overflow-auto">
              <code>{/* Code will appear here... */}</code>
            </div>
          </div>
        </div>
        <Button className="w-full">
          Generate Code
        </Button>
      </CardContent>
    </Card>
  );
};