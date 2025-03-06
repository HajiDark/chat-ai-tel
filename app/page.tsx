"use client"

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Dog, X, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/header'
import { MobileNav } from '@/components/mobile-nav'
import { LoadingAnimation } from '@/components/loading-animation'
import { ImageCard } from '@/components/image-card'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/components/language-provider'
import { ImageGeneration, saveImageToHistory } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false)
  const [width, setWidth] = useState(1024)
  const [height, setHeight] = useState(768)
  const [currentImage, setCurrentImage] = useState<ImageGeneration | null>(null)
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    setCurrentImage(null)
  }, [])

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: t('noPrompt'),
        variant: 'destructive',
      })
      return
    }

    setIsEnhancingPrompt(true)

    try {
      const response = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enhance prompt')
      }

      setPrompt(data.enhancedPrompt)

      toast({
        title: t('enhanced'),
        description: t('enhancePrompt'),
      })
    } catch (error) {
      console.error('Error enhancing prompt:', error)
      toast({
        title: t('enhanceError'),
        variant: 'destructive',
      })
    } finally {
      setIsEnhancingPrompt(false)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: t('noPrompt'),
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          width: Math.round(width / 16) * 16,
          height: Math.round(height / 16) * 16
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      if (!data.imageData) {
        throw new Error('No image data received')
      }

      const newImage: ImageGeneration = {
        id: uuidv4(),
        prompt: prompt.trim(),
        imageData: data.imageData,
        timestamp: Date.now(),
        format: 'png',
      }

      setCurrentImage(newImage)
      saveImageToHistory(newImage)
    } catch (error) {
      console.error('Error generating image:', error)
      toast({
        title: t('generationError'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearPrompt = () => {
    setPrompt('')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-6 md:py-12 space-y-6 mb-16 md:mb-0 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center mb-4">
            <Dog className="h-12 w-12 text-primary mr-2 rtl:ml-2 rtl:mr-0" />
            <h1 className="text-4xl font-bold">Dog AI</h1>
          </div>
          <p className="text-muted-foreground max-w-[600px] mb-8">
            {t('aboutText')}
          </p>

          <div className="w-full max-w-xl mb-4">
            <div className="relative flex">
              <Textarea
                dir='auto'
                placeholder={t('prompt')}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="pr-20 resize-none"
                rows={4}
              />
              <div className="absolute right-0 top-0 h-full flex items-start p-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-1"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancingPrompt || !prompt}
                >
                  <Wand2 className={`h-4 w-4 ${isEnhancingPrompt ? 'animate-pulse' : ''}`} />
                </Button>
                {prompt && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearPrompt}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="w-full max-w-xl flex flex-col items-start mb-6">
            <div className="w-full flex space-x-4 rtl:space-x-reverse">
              <div className="flex flex-col w-1/2">
                <label className="text-sm font-medium text-muted-foreground mb-2">{t('width')}</label>
                <Input
                  type="number"
                  min={256}
                  max={1440}
                  step={16}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  placeholder={t('width')}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col w-1/2">
                <label className="text-sm font-medium text-muted-foreground mb-2">{t('height')}</label>
                <Input
                  type="number"
                  min={256}
                  max={1440}
                  step={16}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  placeholder={t('height')}
                  className="w-full"
                />
              </div>
            </div>

            <p
              className="text-sm text-muted-foreground mt-2"
              dangerouslySetInnerHTML={{ __html: t('dimensionHelp') }}
            ></p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || isEnhancingPrompt}
            className="mb-6"
          >
            {t('generate')}
          </Button>

          {isGenerating ? (
            <LoadingAnimation />
          ) : currentImage ? (
            <div className="w-full max-w-xl">
              <ImageCard
                image={currentImage}
                onDelete={() => setCurrentImage(null)}
              />
            </div>
          ) : null}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}