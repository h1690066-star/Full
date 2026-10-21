import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, Clock, Truck, XCircle, MapPin, User, Phone, Mail, ShoppingBag } from 'lucide-react';
import { getOrderReceiptBlob, updateOrderStatus, getImageUrl } from '../api/api';

export default function OrderReceiptModal({ order, isOpen, onClose, onStatusUpdated }) {
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(order?.status || 'new');

  useEffect(() => {
    if (order && order._id && isOpen) {
      setCurrentStatus(order.status || 'new');
      setLoadingReceipt(true);
      setReceiptError(null);
      getOrderReceiptBlob(order._id)
        .then((url) => {
          setReceiptUrl(url);
        })
        .catch((err) => {
          console.error('Receipt error:', err);
          if (order.receipt) {
            setReceiptUrl(getImageUrl(order.receipt.startsWith('/uploads') ? order.receipt : `/uploads/${order.receipt}`));
          } else {
            setReceiptError('Chek rasmini yuklab bo\'lmadi');
          }
        })
        .finally(() => {
          setLoadingReceipt(false);
        });
    } else {
      setReceiptUrl(null);
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(order._id, newStatus);
      setCurrentStatus(newStatus);
      if (order) order.status = newStatus;
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      alert(err.message || 'Statusni o\'zgartirishda xatolik');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatMoney = (val) => new Intl.NumberFormat('uz-UZ').format(val || 0) + " so'm";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                Buyurtma {order.orderNumber || `XB-${(order._id || '').slice(-6)}`}
              </h2>
              {currentStatus === 'confirmed' || currentStatus === 'Tasdiqlangan' ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tasdiqlangan</span>
                </span>
              ) : currentStatus === 'cancelled' || currentStatus === 'Bekor qilingan' ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1.5 shadow-2xs">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Bekor qilingan</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300 flex items-center gap-1.5 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Yangi</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sana: {new Date(order.createdAt || Date.now()).toLocaleString('uz-UZ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Status Quick Changer Buttons */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="text-xs font-bold text-slate-700">Buyurtma holatini o'zgartirish:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => handleStatusChange('new')}
                disabled={updatingStatus || currentStatus === 'new' || currentStatus === 'Yangi'}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentStatus === 'new' || currentStatus === 'Yangi'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Yangi</span>
              </button>
              
              <button
                onClick={() => handleStatusChange('confirmed')}
                disabled={updatingStatus || currentStatus === 'confirmed' || currentStatus === 'Tasdiqlangan'}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentStatus === 'confirmed' || currentStatus === 'Tasdiqlangan'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tasdiqlangan</span>
              </button>

              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={updatingStatus || currentStatus === 'cancelled' || currentStatus === 'Bekor qilingan'}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentStatus === 'cancelled' || currentStatus === 'Bekor qilingan'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Bekor qilingan</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Customer & Address Details */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Mijoz Ma'lumotlari</span>
                </div>
                <div className="text-xs space-y-1 text-slate-700">
                  <div className="font-bold text-slate-900 text-sm">{order.customer?.name || order.user?.name || 'Mijoz aks etmagan'}</div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{order.customer?.telegram ? `@${order.customer.telegram.replace('@', '')}` : (order.user?.email || 'Telegram/Email yo\'q')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{order.customer?.phone || order.user?.phone || order.address?.phone || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>Yetkazib Berish Manzili</span>
                </div>
                <div className="text-xs space-y-1 text-slate-700">
                  <div className="font-bold text-slate-900">{order.address?.title || 'Asosiy manzil'}</div>
                  <div className="text-slate-600">{order.address?.text || 'Toshkent shahri, Yunusobod 4-mavze'}</div>
                  {order.address?.lat && order.address?.lon && (
                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      Koordinatalar: {order.address.lat}, {order.address.lon}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Receipt Image Preview (Matches API endpoint B: GET /api/orders/:id/receipt) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>To'lov Cheki Rasmi</span>
                </div>

                <div className="w-full h-48 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden relative">
                  {loadingReceipt ? (
                    <div className="text-xs text-slate-400 flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Chek rasm yuklanmoqda...</span>
                    </div>
                  ) : receiptUrl ? (
                    <a href={receiptUrl} target="_blank" rel="noreferrer" className="w-full h-full block">
                      <img
                        src={receiptUrl}
                        alt="To'lov Cheki"
                        className="w-full h-full object-contain p-2 hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          setReceiptError("Chek rasmi serverda topilmadi");
                        }}
                      />
                    </a>
                  ) : (
                    <div className="text-center p-4 text-slate-400 text-xs">
                      {receiptError || 'Chek rasm topilmadi'}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 text-center">
                <span className="text-[10px] text-slate-400 font-medium">
                  Chekni kattalashtirib ko'rish uchun rasm ustiga bosing
                </span>
              </div>
            </div>

          </div>

          {/* Ordered Products Items List */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-slate-500" />
              <span>Buyurtma qilingan mahsulotlar</span>
            </div>

            <div className="divide-y divide-slate-200">
              {Array.isArray(order.items) && order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{item.name || item.product?.name || 'Mahsulot'}</div>
                    <div className="text-[11px] text-slate-400">{item.qty || 1} dona x {formatMoney(item.price)}</div>
                  </div>
                  <div className="font-bold text-slate-900">{formatMoney((item.price || 0) * (item.qty || 1))}</div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between font-black text-slate-900 text-sm">
              <span>Jami Summa:</span>
              <span className="text-base text-black">{formatMoney(order.total)}</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-white flex justify-end sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-black hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Yopish
          </button>
        </div>

      </div>
    </div>
  );
}
