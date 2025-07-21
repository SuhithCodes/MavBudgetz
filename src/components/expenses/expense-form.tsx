"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Camera, Loader2, UploadCloud, X, PenLine, Clock, Receipt, CreditCard } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { processReceipt } from "@/lib/actions"
import { cn } from "@/lib/utils"
import { type Expense, type ExpenseFormData, expenseFormSchema, type ProcessedReceiptData } from "@/types"

interface ExpenseFormProps {
    onSubmit: (expense: ExpenseFormData) => void;
    initialData?: Expense;
}

const DEFAULT_CURRENCY = "USD";

export function ExpenseForm({ onSubmit: onExpenseSubmit, initialData }: ExpenseFormProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [processedData, setProcessedData] = useState<ProcessedReceiptData | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const form = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseFormSchema),
        defaultValues: initialData || {
            vendorName: "",
            date: new Date().toISOString().split('T')[0],
            totalAmount: 0,
            category: "",
            lineItems: [],
            taxes: 0,
            currency: DEFAULT_CURRENCY,
            paymentMethod: "",
            subtotal: 0,
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
    }, [initialData, form]);

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // Cleanup camera on component unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const handleReceiptImage = async (dataURI: string) => {
        if (!dataURI) return;

        resetForm(false);
        setPreviewUrl(dataURI);
        setIsProcessing(true);

        const result = await processReceipt(dataURI);
        
        if ("error" in result) {
            toast({
                variant: "destructive",
                title: "Processing Failed",
                description: result.error,
            });
            resetForm();
        } else {
            setProcessedData(result);
            const newDate = new Date(result.date).toISOString().split('T')[0];
            form.reset({
                ...result,
                date: newDate,
            });
        }
        setIsProcessing(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            handleReceiptImage(reader.result as string);
        };
        reader.onerror = () => {
            toast({ variant: "destructive", title: "Error", description: "Failed to read file." });
            resetForm();
        }
    };
    
    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext("2d");
        context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        const dataURI = canvas.toDataURL("image/jpeg");
        stopCamera();
        handleReceiptImage(dataURI);
    };

    const startCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasCameraPermission(true);
            } catch (error) {
                console.error("Error accessing camera:", error);
                setHasCameraPermission(false);
                toast({
                    variant: "destructive",
                    title: "Camera Access Denied",
                    description: "Please enable camera permissions in your browser settings.",
                });
            }
        } else {
            setHasCameraPermission(false);
            toast({
                variant: "destructive",
                title: "Camera Not Supported",
                description: "Your browser does not support camera access.",
            });
        }
    };

    const handleTabChange = (value: string) => {
        if (value === 'camera') {
            startCamera();
        } else {
            stopCamera();
        }
        
        if (value === 'manual') {
            resetForm();
            setProcessedData(null);
            form.reset({
                ...form.getValues(),
                date: new Date().toISOString().split('T')[0],
            });
        }
    };

    const resetForm = (clearFileInput = true) => {
        setIsProcessing(false);
        setPreviewUrl(null);
        setProcessedData(null);
        form.reset();
        if (clearFileInput && fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        stopCamera();
        setHasCameraPermission(undefined);
    };

    const handleSubmit = (data: ExpenseFormData) => {
        onExpenseSubmit(data);
        if (!initialData) { // Only reset if it's a new expense
            toast({ title: "Expense Saved", description: `${data.vendorName} has been added to your expenses.` });
            resetForm();
        }
    };

    const ExpenseFields = () => (
        <div className="space-y-4 animate-in fade-in duration-500">
            {previewUrl && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border bg-muted/20">
                    <Image src={previewUrl} alt="Receipt preview" layout="fill" objectFit="contain" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md" onClick={() => resetForm()}>
                        <X className="h-4 w-4"/>
                        <span className="sr-only">Clear form</span>
                    </Button>
                </div>
            )}
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="vendorName">Vendor Name *</Label>
                    <Input 
                        id="vendorName" 
                        {...form.register("vendorName")}
                        placeholder="Enter vendor name"
                    />
                    {form.formState.errors.vendorName && (
                        <p className="text-sm text-destructive">{form.formState.errors.vendorName.message}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="category">Category *</Label>
                    <Input 
                        id="category" 
                        {...form.register("category")}
                        placeholder="e.g., Groceries, Entertainment"
                    />
                    {form.formState.errors.category && (
                        <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                    )}
                </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="date">Date *</Label>
                    <div className="relative">
                        <Input 
                            id="date" 
                            type="date" 
                            {...form.register("date")}
                        />
                        {form.formState.errors.date && (
                            <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
                        )}
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="time">Time</Label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="time" 
                            type="time" 
                            className="pl-9"
                            {...form.register("time")}
                        />
                    </div>
                </div>
            </div>

            {/* Amount Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="subtotal">Subtotal</Label>
                    <div className="relative">
                        <Receipt className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="subtotal" 
                            type="number" 
                            step="0.01"
                            className="pl-9"
                            {...form.register("subtotal", { valueAsNumber: true })}
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="taxes">Tax</Label>
                    <Input 
                        id="taxes" 
                        type="number" 
                        step="0.01"
                        {...form.register("taxes", { valueAsNumber: true })}
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="totalAmount">Total Amount *</Label>
                    <div className="relative">
                        <Input 
                            id="totalAmount" 
                            type="number" 
                            step="0.01"
                            {...form.register("totalAmount", { valueAsNumber: true })}
                            placeholder="0.00"
                        />
                        {form.formState.errors.totalAmount && (
                            <p className="text-sm text-destructive">{form.formState.errors.totalAmount.message}</p>
                        )}
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="currency">Currency</Label>
                    <Input 
                        id="currency" 
                        {...form.register("currency")}
                        placeholder="USD"
                        maxLength={3}
                    />
                </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="paymentMethod" 
                        className="pl-9"
                        {...form.register("paymentMethod")}
                        placeholder="e.g., Credit Card, Cash"
                    />
                </div>
            </div>

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Expense
            </Button>
        </div>
    );

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
            <Tabs defaultValue="upload" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                    <TabsTrigger value="camera">Scan Receipt</TabsTrigger>
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload">
                    {!processedData ? (
                        <div className="relative mt-4">
                            <Label htmlFor="receipt-upload" className={cn(
                                "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                                isProcessing && "cursor-wait bg-muted/50"
                            )}>
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                        <p className="mt-4 text-sm text-muted-foreground">Analyzing your receipt...</p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="h-10 w-10 text-muted-foreground" />
                                        <p className="mt-4 text-sm text-muted-foreground">
                                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG or PDF</p>
                                    </>
                                )}
                            </Label>
                            <Input ref={fileInputRef} id="receipt-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, application/pdf" disabled={isProcessing} />
                        </div>
                    ) : (
                        <ExpenseFields />
                    )}
                </TabsContent>

                <TabsContent value="camera">
                    {!processedData ? (
                        <div className="mt-4 space-y-4">
                            <div className="w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center aspect-video">
                                <video ref={videoRef} className={cn("w-full h-full object-cover", { 'hidden': hasCameraPermission !== true })} autoPlay muted playsInline />
                                {hasCameraPermission === false && (
                                     <div className="p-4">
                                        <Alert variant="destructive">
                                            <AlertTitle>Camera Access Required</AlertTitle>
                                            <AlertDescription>
                                                Please allow camera access in your browser to use this feature. You may need to refresh the page.
                                            </AlertDescription>
                                        </Alert>
                                     </div>
                                )}
                                {hasCameraPermission === undefined && !isProcessing && (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        <p className="text-muted-foreground">Requesting camera...</p>
                                    </div>
                                )}
                            </div>
                            <Button type="button" className="w-full" onClick={handleCapture} disabled={!hasCameraPermission || isProcessing}>
                                <Camera className="mr-2 h-4 w-4" />
                                {isProcessing ? 'Capturing...' : 'Capture Photo'}
                            </Button>
                            <canvas ref={canvasRef} className="hidden"></canvas>
                        </div>
                    ) : (
                        <ExpenseFields />
                    )}
                </TabsContent>

                <TabsContent value="manual">
                    <div className="mt-4">
                        <Alert className="mb-6">
                            <PenLine className="h-4 w-4" />
                            <AlertTitle>Manual Entry</AlertTitle>
                            <AlertDescription>
                                Enter your expense details manually without scanning a receipt.
                            </AlertDescription>
                        </Alert>
                        <ExpenseFields />
                    </div>
                </TabsContent>
            </Tabs>
        </form>
    );
}
