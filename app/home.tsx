'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Brain, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast'

interface AnalysisResult {
  predicted_class: string;
  confidence: number;
  entropy: number;
  variance: number;
  lime_explanation?: string;
  counterfactuals?: string[];
}

const HomePage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a JPG or PNG image.",
        variant: "destructive"
      });
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/explain', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
      toast({
        title: "Analysis Complete",
        description: `Detected: ${data.predicted_class} (${(data.confidence * 100).toFixed(1)}% confidence)`
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setError('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Brain className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Brain Tumor Classification AI</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Advanced AI model for detecting brain tumors from MRI images. Upload an MRI scan to get detailed analysis including tumor classification, confidence metrics, and visual explanations.
          </p>
        </div>

        {/* Upload Section */}
        <Card className="max-w-4xl mx-auto mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div 
              className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer bg-blue-50/50"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Upload MRI Image
              </h3>
              <p className="text-gray-500 mb-4">
                Drag and drop your MRI image here, or click to browse
              </p>
              <p className="text-sm text-gray-400">
                Supports JPG and PNG files
              </p>
              <input
                id="file-input"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {selectedFile && (
              <div className="mt-8 flex flex-col sm:flex-row gap-6 items-center">
                <div className="text-center">
                  <img 
                    src={previewUrl} 
                    alt="Uploaded MRI" 
                    className="max-w-xs max-h-64 rounded-lg shadow-md border"
                  />
                  <p className="mt-2 text-sm text-gray-600">{selectedFile.name}</p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={analyzeImage} 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                  >
                    {isLoading ? 'Analyzing...' : 'Analyze Image'}
                  </Button>
                  <Button 
                    onClick={resetAll} 
                    variant="outline"
                    className="px-8 py-3 text-lg"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="max-w-4xl mx-auto mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {result && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Main Results */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Analysis Results</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">Predicted Class</h3>
                      <p className="text-3xl font-bold text-blue-700 capitalize">{result.predicted_class}</p>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">Confidence</h3>
                      <p className="text-3xl font-bold text-green-700">{(result.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-purple-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-purple-900 mb-2">Entropy</h3>
                      <p className="text-2xl font-bold text-purple-700">{result.entropy.toFixed(4)}</p>
                      <p className="text-sm text-purple-600 mt-1">Measure of prediction uncertainty</p>
                    </div>
                    
                    <div className="bg-orange-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-orange-900 mb-2">Variance</h3>
                      <p className="text-2xl font-bold text-orange-700">{result.variance.toFixed(4)}</p>
                      <p className="text-sm text-orange-600 mt-1">Variability in predictions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LIME Explanation - Only if not "notumor" */}
            {result.predicted_class !== 'notumor' && result.lime_explanation && (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">LIME Explanation</h2>
                  <p className="text-gray-600 mb-6">
                    This visualization highlights the regions of the image that most influenced the AI&apos;s decision.
                  </p>
                  <div className="flex justify-center">
                    <img 
                      src={`data:image/png;base64,${result.lime_explanation}`}
                      alt="LIME Explanation" 
                      className="max-w-full max-h-96 rounded-lg shadow-md border"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Counterfactuals - Only if not "notumor" */}
            {result.predicted_class !== 'notumor' && result.counterfactuals && result.counterfactuals.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Counterfactual Examples</h2>
                  <p className="text-gray-600 mb-6">
                    These images show how the scan would need to change for a different classification.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {result.counterfactuals.map((counterfactual, index) => (
                      <div key={index} className="text-center">
                        <img 
                          src={`data:image/png;base64,${counterfactual}`}
                          alt={`Counterfactual ${index + 1}`}
                          className="w-full max-h-48 object-contain rounded-lg shadow-md border"
                        />
                        <p className="mt-2 text-sm text-gray-600">Counterfactual {index + 1}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
