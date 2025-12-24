import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { handoverApi } from '@/api/handover.api';
import { lostApi } from '@/api/lost.api';
import { foundApi } from '@/api/found.api';
import type { Handover } from '@/types/handover.types';
import type { LostItem } from '@/types/lost.types';
import type { FoundItem } from '@/types/found.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import ChatBox from '@/components/features/ChatBox';
import { formatDateTime } from '@/utils/formatters';

export default function HandoverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [handover, setHandover] = useState<Handover | null>(null);
  const [lostItem, setLostItem] = useState<LostItem | null>(null);
  const [foundItem, setFoundItem] = useState<FoundItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // 일정 확정용
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleAt, setScheduleAt] = useState('');
  const [meetPlace, setMeetPlace] = useState('');

  // 거절 사유
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // 취소 사유
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (id) {
      fetchData(parseInt(id));
    }
  }, [id]);

  const fetchData = async (handoverId: number) => {
    try {
      setLoading(true);
      const handoverData = await handoverApi.getById(handoverId);
      setHandover(handoverData);

      const [lost, found] = await Promise.all([
        lostApi.getById(handoverData.lostId),
        foundApi.getById(handoverData.foundId),
      ]);
      setLostItem(lost);
      setFoundItem(found);
    } catch (err: any) {
      setError(err.response?.data?.message || '정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 승인 (습득자)
  const handleAccept = async () => {
    if (!handover) return;
    if (!confirm('이 인계 요청을 승인하시겠습니까?')) return;

    try {
      setProcessing(true);
      await handoverApi.accept(handover.id);
      await fetchData(handover.id);
      alert('승인되었습니다!');
    } catch (err: any) {
      alert(err.response?.data?.message || '승인에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  // 거절 (습득자)
  const handleReject = async () => {
    if (!handover || !rejectReason.trim()) {
      alert('거절 사유를 입력해주세요.');
      return;
    }

    try {
      setProcessing(true);
      await handoverApi.reject(handover.id, rejectReason);
      await fetchData(handover.id);
      alert('거절되었습니다.');
      setShowRejectForm(false);
      setRejectReason('');
    } catch (err: any) {
      alert(err.response?.data?.message || '거절 처리에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  // 일정 확정
  const handleSchedule = async () => {
    if (!handover || !scheduleAt || !meetPlace.trim()) {
      alert('일정과 장소를 모두 입력해주세요.');
      return;
    }

    try {
      setProcessing(true);
      await handoverApi.schedule(handover.id, scheduleAt, meetPlace);
      await fetchData(handover.id);
      alert('일정이 확정되었습니다!');
      setShowScheduleForm(false);
    } catch (err: any) {
      alert(err.response?.data?.message || '일정 확정에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  // 완료 처리
  const handleComplete = async () => {
    if (!handover) return;
    if (!confirm('인계를 완료 처리하시겠습니까?')) return;

    try {
      setProcessing(true);
      await handoverApi.complete(handover.id);
      await fetchData(handover.id);
      alert('인계가 완료되었습니다! 🎉');
    } catch (err: any) {
      alert(err.response?.data?.message || '완료 처리에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  // 취소
  const handleCancel = async () => {
    if (!handover || !cancelReason.trim()) {
      alert('취소 사유를 입력해주세요.');
      return;
    }

    try {
      setProcessing(true);
      await handoverApi.cancel(handover.id, cancelReason);
      await fetchData(handover.id);
      alert('취소되었습니다.');
      setShowCancelForm(false);
      setCancelReason('');
    } catch (err: any) {
      alert(err.response?.data?.message || '취소 처리에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loading />;

  if (error || !handover || !lostItem || !foundItem) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#ffe6e6', 
          color: '#cc0000', 
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          {error || '정보를 불러올 수 없습니다.'}
        </div>
        <button 
          onClick={() => navigate(-1)}
          style={{ marginTop: '20px', padding: '10px 20px' }}
        >
          돌아가기
        </button>
      </div>
    );
  }

  const isRequester = currentUser && currentUser.id === handover.requesterId;
  const isResponder = currentUser && currentUser.id === handover.responderId;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>
      </div>

      <h1 style={{ marginBottom: '10px' }}>인계 상세</h1>
      <div style={{ marginBottom: '30px' }}>
        <StatusBadge status={handover.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* 분실 신고 정보 */}
        <div style={{ 
          border: '1px solid #0066cc',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#f0f7ff',
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#0066cc' }}>
            분실 신고
          </h3>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ 
              padding: '4px 8px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              fontSize: '12px',
              marginRight: '8px',
            }}>
              {lostItem.category}
            </span>
            <strong>{lostItem.title}</strong>
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {lostItem.description}
          </div>
          <div style={{ marginTop: '8px', fontSize: '13px', color: '#999' }}>
            📍 {lostItem.lostPlace} | 🕐 {formatDateTime(lostItem.lostAt)}
          </div>
          <button
            onClick={() => navigate(`/lost/${lostItem.id}`)}
            style={{ 
              marginTop: '12px',
              padding: '8px 16px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            상세 보기
          </button>
        </div>

        {/* 습득물 정보 */}
        <div style={{ 
          border: '1px solid #00cc66',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#f0fff4',
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#00cc66' }}>
            습득물
          </h3>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ 
              padding: '4px 8px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              fontSize: '12px',
              marginRight: '8px',
            }}>
              {foundItem.category}
            </span>
            <strong>{foundItem.title}</strong>
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {foundItem.description}
          </div>
          <div style={{ marginTop: '8px', fontSize: '13px', color: '#999' }}>
            📍 {foundItem.foundPlace} | 🕐 {formatDateTime(foundItem.foundAt)}
            <br />
            📦 {foundItem.storageLocation}
          </div>
          <button
            onClick={() => navigate(`/found/${foundItem.id}`)}
            style={{ 
              marginTop: '12px',
              padding: '8px 16px',
              backgroundColor: '#00cc66',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            상세 보기
          </button>
        </div>
      </div>

      {/* 계속... */}
      <HandoverActions
        handover={handover}
        isRequester={isRequester}
        isResponder={isResponder}
        processing={processing}
        showScheduleForm={showScheduleForm}
        setShowScheduleForm={setShowScheduleForm}
        scheduleAt={scheduleAt}
        setScheduleAt={setScheduleAt}
        meetPlace={meetPlace}
        setMeetPlace={setMeetPlace}
        handleAccept={handleAccept}
        showRejectForm={showRejectForm}
        setShowRejectForm={setShowRejectForm}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        handleReject={handleReject}
        handleSchedule={handleSchedule}
        handleComplete={handleComplete}
        showCancelForm={showCancelForm}
        setShowCancelForm={setShowCancelForm}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        handleCancel={handleCancel}
      />

      {/* 채팅 */}
      <div style={{ marginTop: '30px' }}>
        <ChatBox handoverId={handover.id} currentUserId={currentUser?.id || 0} />
      </div>
    </div>
  );
}

// 액션 버튼 컴포넌트 (분리)
interface HandoverActionsProps {
  handover: Handover;
  isRequester: boolean;
  isResponder: boolean;
  processing: boolean;
  showScheduleForm: boolean;
  setShowScheduleForm: (show: boolean) => void;
  scheduleAt: string;
  setScheduleAt: (value: string) => void;
  meetPlace: string;
  setMeetPlace: (value: string) => void;
  handleAccept: () => void;
  showRejectForm: boolean;
  setShowRejectForm: (show: boolean) => void;
  rejectReason: string;
  setRejectReason: (value: string) => void;
  handleReject: () => void;
  handleSchedule: () => void;
  handleComplete: () => void;
  showCancelForm: boolean;
  setShowCancelForm: (show: boolean) => void;
  cancelReason: string;
  setCancelReason: (value: string) => void;
  handleCancel: () => void;
}

function HandoverActions(props: HandoverActionsProps) {
  const {
    handover,
    isResponder,
    processing,
    showScheduleForm,
    setShowScheduleForm,
    scheduleAt,
    setScheduleAt,
    meetPlace,
    setMeetPlace,
    handleAccept,
    showRejectForm,
    setShowRejectForm,
    rejectReason,
    setRejectReason,
    handleReject,
    handleSchedule,
    handleComplete,
    showCancelForm,
    setShowCancelForm,
    cancelReason,
    setCancelReason,
    handleCancel,
  } = props;

  return (
    <>
      {/* 인계 정보 */}
      <div style={{ 
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: 'white',
      }}>
        <h3 style={{ marginTop: 0 }}>인계 정보</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px' }}>
          <div style={{ fontWeight: 'bold', color: '#666' }}>인계 방법</div>
          <div>
            {handover.method === 'MEET' ? '대면 인계' : 
             handover.method === 'OFFICE' ? '관리실 인계' : '배송 인계'}
          </div>

          <div style={{ fontWeight: 'bold', color: '#666' }}>요청 일시</div>
          <div>{formatDateTime(handover.createdAt)}</div>

          {handover.acceptedByFinderAt && (
            <>
              <div style={{ fontWeight: 'bold', color: '#666' }}>승인 일시</div>
              <div>{formatDateTime(handover.acceptedByFinderAt)}</div>
            </>
          )}

          {handover.scheduleAt && (
            <>
              <div style={{ fontWeight: 'bold', color: '#666' }}>예정 일시</div>
              <div>{formatDateTime(handover.scheduleAt)}</div>
            </>
          )}

          {handover.meetPlace && (
            <>
              <div style={{ fontWeight: 'bold', color: '#666' }}>인계 장소</div>
              <div>{handover.meetPlace}</div>
            </>
          )}

          {handover.completedAt && (
            <>
              <div style={{ fontWeight: 'bold', color: '#666' }}>완료 일시</div>
              <div>{formatDateTime(handover.completedAt)}</div>
            </>
          )}

          {handover.cancelReason && (
            <>
              <div style={{ fontWeight: 'bold', color: '#cc0000' }}>취소 사유</div>
              <div style={{ color: '#cc0000' }}>{handover.cancelReason}</div>
            </>
          )}
        </div>
      </div>

      {/* 액션 버튼들 */}
      {handover.status === 'REQUESTED' && isResponder && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button
            onClick={handleAccept}
            disabled={processing}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: processing ? '#ccc' : '#00cc66',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            ✅ 승인하기
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={processing}
            style={{
              padding: '16px 24px',
              backgroundColor: processing ? '#ccc' : '#cc0000',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            ❌ 거절
          </button>
        </div>
      )}

      {/* 거절 폼 */}
      {showRejectForm && (
        <div style={{ 
          marginBottom: '20px',
          padding: '20px',
          border: '2px solid #cc0000',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
        }}>
          <h4 style={{ marginTop: 0 }}>거절 사유 입력</h4>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="거절 사유를 입력해주세요"
            rows={3}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleReject} disabled={processing} style={{ flex: 1, padding: '10px', backgroundColor: '#cc0000', color: 'white', border: 'none', borderRadius: '4px', cursor: processing ? 'not-allowed' : 'pointer' }}>
              {processing ? '처리 중...' : '거절 확정'}
            </button>
            <button onClick={() => setShowRejectForm(false)} style={{ padding: '10px 20px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
              취소
            </button>
          </div>
        </div>
      )}

      {/* 일정 확정 버튼 */}
      {(handover.status === 'ACCEPTED_BY_FINDER' || handover.status === 'APPROVED_BY_OFFICE') && !handover.scheduleAt && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setShowScheduleForm(true)}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#ff9900',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            📅 일정 확정하기
          </button>
        </div>
      )}

      {/* 일정 확정 폼 */}
      {showScheduleForm && (
        <div style={{ 
          marginBottom: '20px',
          padding: '20px',
          border: '2px solid #ff9900',
          borderRadius: '8px',
          backgroundColor: '#fff4e6',
        }}>
          <h4 style={{ marginTop: 0 }}>일정 및 장소 설정</h4>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              인계 일시
            </label>
            <input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              style={{ width: '100%', padding: '10px' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              인계 장소
            </label>
            <input
              type="text"
              value={meetPlace}
              onChange={(e) => setMeetPlace(e.target.value)}
              placeholder="예: 학생회관 1층 로비"
              style={{ width: '100%', padding: '10px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSchedule} disabled={processing} style={{ flex: 1, padding: '10px', backgroundColor: '#ff9900', color: 'white', border: 'none', borderRadius: '4px', cursor: processing ? 'not-allowed' : 'pointer' }}>
              {processing ? '처리 중...' : '일정 확정'}
            </button>
            <button onClick={() => setShowScheduleForm(false)} style={{ padding: '10px 20px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
              취소
            </button>
          </div>
        </div>
      )}

      {/* 완료 버튼 */}
      {handover.status === 'SCHEDULED' && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleComplete}
            disabled={processing}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: processing ? '#ccc' : '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            ✅ 인계 완료 처리
          </button>
        </div>
      )}

      {/* 취소 버튼 */}
      {handover.status !== 'COMPLETED' && handover.status !== 'CANCELED' && (
        <div>
          <button
            onClick={() => setShowCancelForm(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#cc0000',
            }}
          >
            취소하기
          </button>
        </div>
      )}

      {/* 취소 폼 */}
      {showCancelForm && (
        <div style={{ 
          marginTop: '20px',
          padding: '20px',
          border: '2px solid #cc0000',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
        }}>
          <h4 style={{ marginTop: 0 }}>취소 사유 입력</h4>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="취소 사유를 입력해주세요"
            rows={3}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleCancel} disabled={processing} style={{ flex: 1, padding: '10px', backgroundColor: '#cc0000', color: 'white', border: 'none', borderRadius: '4px', cursor: processing ? 'not-allowed' : 'pointer' }}>
              {processing ? '처리 중...' : '취소 확정'}
            </button>
            <button onClick={() => setShowCancelForm(false)} style={{ padding: '10px 20px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
