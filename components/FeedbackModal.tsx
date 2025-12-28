
import React, { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Suggestion',
    message: ''
  });

  if (!isOpen) return null;

  const encode = (data: Record<string, string>) => {
    return Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({ 
          "form-name": "feedback", 
          "name": formData.name,
          "category": formData.type,
          "message": formData.message
        })
      });

      if (response.ok) {
        setStep('success');
      } else {
        throw new Error('Failed to send feedback to server.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '20px', animation: 'fadeIn 0.2s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .feedback-modal { 
          background: white; border-radius: 24px; width: 100%; max-width: 480px; 
          padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .form-input { 
          width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0;
          font-family: inherit; font-size: 14px; margin-bottom: 20px; outline: none; transition: border-color 0.2s;
          background: white; color: #1e293b;
        }
        .form-input:focus { border-color: #3b82f6; }
        .form-input:disabled { background: #f8fafc; cursor: not-allowed; }
        .submit-btn {
          width: 100%; padding: 14px; background: #3b82f6; color: white; border: none;
          border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .submit-btn:hover:not(:disabled) { background: #2563eb; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .error-msg {
          background: #fef2f2; color: #991b1b; padding: 12px; border-radius: 10px;
          font-size: 13px; font-weight: 600; margin-bottom: 20px; border: 1px solid #fee2e2;
        }
      `}</style>

      <div className="feedback-modal">
        {step === 'form' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Give Feedback</h2>
              <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: '#64748b' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px', fontWeight: 500 }}>
              How can we make Smart EMI Pro better for you? We love hearing your ideas.
            </p>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit} data-netlify="true" name="feedback">
              <input type="hidden" name="form-name" value="feedback" />
              
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Name (Optional)</label>
              <input 
                className="form-input" 
                name="name"
                placeholder="John Doe" 
                value={formData.name}
                disabled={isSubmitting}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Category</label>
              <select 
                className="form-input"
                name="category"
                value={formData.type}
                disabled={isSubmitting}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option>Suggestion</option>
                <option>Bug Report</option>
                <option>Question</option>
                <option>Other</option>
              </select>

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Message</label>
              <textarea 
                className="form-input" 
                name="message"
                rows={4} 
                required 
                placeholder="What's on your mind?"
                style={{ resize: 'none' }}
                value={formData.message}
                disabled={isSubmitting}
                onChange={e => setFormData({...formData, message: e.target.value})}
              ></textarea>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Sending...
                  </>
                ) : (
                  'Send Suggestion'
                )}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ 
              width: '64px', height: '64px', background: '#dcfce7', color: '#166534', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', margin: '0 auto 24px'
            }}>
              <i className="fas fa-check"></i>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Thank You!</h2>
            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
              Your feedback helps us build a better financial tool for everyone. We read every single suggestion!
            </p>
            <button onClick={onClose} className="submit-btn" style={{ background: '#0f172a' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
