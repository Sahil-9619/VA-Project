"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Lock, Shield } from "lucide-react";
import { completeEnrollment } from "@/lib/store/features/enrollmentSlice";
import { toast } from "sonner";
import stripePromise from "@/lib/stripe";

const PaymentModal = ({ isOpen, onClose, course, paymentData, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useDispatch();

  const handleStripePayment = async () => {
    setIsProcessing(true);

    try {
      const stripe = await stripePromise;

      // Create payment intent on your backend
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course._id,
          amount: course.discountPrice || course.price,
          currency: "usd",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response from payment server");
      }

      const { clientSecret, paymentIntentId } = await response.json();

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: {
              // You would use Stripe Elements here for card input
              // This is a simplified example
            },
          },
        }
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // Complete enrollment
        await dispatch(
          completeEnrollment({
            paymentId: paymentData.paymentId,
            transactionId: paymentIntent.id,
            metadata: {
              paymentIntentId: paymentIntentId,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
            },
          })
        ).unwrap();

        toast.success("Payment successful! You are now enrolled.");
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error("Payment failed. Please try again.");
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDemoPayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(async () => {
      try {
        await dispatch(
          completeEnrollment({
            paymentId: paymentData.paymentId,
            transactionId: `demo_${Date.now()}`,
            metadata: {
              demo: true,
              amount: course.discountPrice || course.price,
            },
          })
        ).unwrap();

        toast.success("Demo payment successful! You are now enrolled.");
        onSuccess();
        onClose();
      } catch (error) {
        toast.error("Enrollment failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Your Purchase
          </DialogTitle>
          <DialogDescription>
            You're about to enroll in "{course?.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Course Summary */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{course?.title}</span>
                <span className="font-bold">
                  ${course?.discountPrice || course?.price}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-2">
            <Button
              onClick={handleDemoPayment}
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              {isProcessing ? "Processing..." : "Pay with Demo"}
            </Button>

            {/* You can add real Stripe payment button here */}
            {/* <Button
              onClick={handleStripePayment}
              disabled={isProcessing}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Shield className="h-4 w-4 mr-2" />
              Pay with Stripe
            </Button> */}
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Your payment information is secure and encrypted</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
