import type { Response } from 'express';
import crypto from 'crypto';
import pool from '../config/db.js';

export const processPayment = async (req: any, res: Response) => {
    const {
        order_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        payment_method = 'razorpay'
    } = req.body;

    try {
        // 1. SECURE CHECK: Verify Razorpay signature
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            throw new Error('Razorpay secret not configured on server');
        }

        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // 2. Update database
        const paymentResult = await pool.query(
            `INSERT INTO payments (order_id, payment_method, status, transaction_id, raw_response, created_at) 
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
             ON CONFLICT (order_id) 
             DO UPDATE SET status = $3, transaction_id = $4, raw_response = $5, created_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [order_id, payment_method, 'success', razorpay_payment_id, JSON.stringify(req.body)]
        );

        // Update order status to 'paid' and also set detailed payment_status
        await pool.query(
            "UPDATE orders SET current_status = 'paid' WHERE id = $1",
            [order_id]
        );

        res.json({ success: true, payment: paymentResult.rows[0] });
    } catch (error: any) {
        console.error(`Payment processing error for order ${order_id}:`, error);
        res.status(500).json({ message: error.message });
    }
};

export const getPaymentStatus = async (req: any, res: Response) => {
    const { order_id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM payments WHERE order_id = $1', [order_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Payment record not found' });
        }
        res.json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
