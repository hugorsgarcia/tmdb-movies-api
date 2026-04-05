'use client';

import { useState, useEffect } from 'react';
import { fetchStreamingProviders } from '@/utils/tmdb';
import { supabase } from '@/lib/supabase';
import './index.scss';

interface StreamingProvider {
  provider_id: number;
  provider_name: string;
}

interface ReminderModalProps {
  mediaId: string;
  mediaType: 'movie' | 'tv';
  mediaTitle: string;
  onClose: () => void;
}

export function ReminderModal({ 
  mediaId, 
  mediaType, 
  mediaTitle, 
  onClose 
}: ReminderModalProps) {
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [destination, setDestination] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [providersText, setProvidersText] = useState('infelizmente não encontramos links de streaming oficiais no momento.');

  useEffect(() => {
    fetchStreamingProviders(mediaType, mediaId)
      .then((results: any) => {
        const br = results['BR'];
        if (br) {
          const allProviders = [...(br.flatrate || []), ...(br.rent || []), ...(br.buy || [])];
          if (allProviders.length > 0) {
            // Deduplicate names
            const names = Array.from(new Set(allProviders.map((p: any) => p.provider_name)));
            setProvidersText(`disponível em: ${names.join(', ')}`);
          }
        }
      })
      .catch(() => {});
  }, [mediaType, mediaId]);

  const handleSave = async () => {
    if (!destination) {
      setError('Por favor, informe seu '+ (channel === 'whatsapp' ? 'Número' : 'Email') +'.');
      return;
    }
    if (!scheduledAt) {
      setError('Por favor, escolha a data e a hora do lembrete.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const messageBody = `🍿 Oi! Você pediu para o CineSync lembrar você de assistir: *${mediaTitle}*!\n\nEle está ${providersText}\n\nAproveite sua sessão! 🎬`;

      // Make sure date is in ISO string formatted correctly in localtime
      const isoDate = new Date(scheduledAt).toISOString();

      // Get the user's access token to authenticate the API call
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          channel,
          destination,
          title: mediaTitle,
          messageBody,
          scheduledAt: isoDate,
        })
      });

      if (!res.ok) {
        throw new Error('Falha ao salvar o lembrete');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reminder-modal-backdrop">
      <div className="reminder-modal">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Lembrete: {mediaTitle}</h2>

        {success ? (
          <div className="success-msg">
            Tudo certo! Lembrete agendado com sucesso. 🎉
          </div>
        ) : (
          <div className="modal-content">
            <p className="subtitle">Selecione onde e quando deseja ser lembrado.</p>

            <div className="form-group">
              <label>Canal de Notificação:</label>
              <div className="channel-options">
                <button 
                  className={`channel-btn ${channel === 'whatsapp' ? 'active' : ''}`}
                  onClick={() => setChannel('whatsapp')}
                >
                  WhatsApp
                </button>
                <button 
                  className={`channel-btn ${channel === 'email' ? 'active' : ''}`}
                  onClick={() => setChannel('email')}
                >
                  E-mail
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>{channel === 'whatsapp' ? 'Seu Número (com DDD):' : 'Seu E-mail:'}</label>
              <input 
                type={channel === 'whatsapp' ? 'tel' : 'email'} 
                placeholder={channel === 'whatsapp' ? 'Ex: 11999999999' : 'seu@email.com'}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Quando (Data e Hora):</label>
              <input 
                type="datetime-local" 
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button className="submit-btn" onClick={handleSave} disabled={loading}>
              {loading ? 'Salvando...' : 'Agendar Lembrete'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
