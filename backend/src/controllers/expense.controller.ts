import { Request, Response, NextFunction } from 'express';
import { Expense } from '../models/expense.model.js';

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, category, amount, note } = req.body;
    const userId = (req as any).user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'จำนวนเงินต้องมากกว่า 0' });
    }

    const expense = new Expense({
      user: userId,
      date: date || new Date(),
      category: category || 'ทั่วไป',
      amount,
      note
    });

    await expense.save();

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const expenseId = req.params.id;

    const expense = await Expense.findOneAndDelete({ _id: expenseId, user: userId });
    if (!expense) {
      return res.status(404).json({ message: 'ไม่พบรายการรายจ่าย หรือคุณไม่มีสิทธิ์ลบ' });
    }

    res.status(200).json({ success: true, message: 'ลบรายการรายจ่ายเรียบร้อยแล้ว' });
  } catch (error) {
    next(error);
  }
};
