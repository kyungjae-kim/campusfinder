import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {foundApi} from '@/api/found.api';
import type {FoundItem} from '@/types/found.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import {formatDateTime} from '@/utils/formatters';

export default function StorageManagePage() {
    const navigate = useNavigate();
    const [items, setItems] = useState<FoundItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'OFFICE' | 'SECURITY'>('ALL');

    const [selectedItem, setSelectedItem] = useState<FoundItem | null>(null);
    const [storageLocation, setStorageLocation] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await foundApi.getAll({page: 0, size: 100});
            setItems(response.content);
        } catch (err: any) {
            setError(err.response?.data?.message || '목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStorage = async () => {
        if (!selectedItem || !storageLocation.trim()) {
            alert('보관 위치를 입력해주세요.');
            return;
        }

        try {
            setProcessing(true);

            await foundApi.updateStorage(selectedItem.id, storageLocation);

            setItems(prevItems =>
                prevItems.map(item =>
                    item.id === selectedItem.id
                        ? {
                            ...item,
                            storageLocation, // 보관 위치만 업데이트
                        }
                        : item
                )
            );

            setSelectedItem(null);
            setStorageLocation('');
            alert('보관 정보가 업데이트되었습니다!');
        } catch (err: any) {
            alert(err.response?.data?.message || '업데이트에 실패했습니다.');
        } finally {
            setProcessing(false);
        }
    };

    const filteredItems = items.filter(item => {
        if (filter === 'OFFICE') {
            return item.storageType === 'OFFICE';
        } else if (filter === 'SECURITY') {
            return item.storageType === 'SECURITY';
        }
        return item.storageType === 'OFFICE' || item.storageType === 'SECURITY';
    });

    const officeCount = items.filter(i => i.storageType === 'OFFICE').length;
    const securityCount = items.filter(i => i.storageType === 'SECURITY').length;

    if (loading) return <Loading/>;

    return (
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '20px'}}>
            {/* 헤더 */}
            <div style={{marginBottom: '20px'}}>
                <button onClick={() => navigate('/dashboard')} style={{marginRight: '10px'}}>
                    ← 대시보드
                </button>
                <h1 style={{display: 'inline', marginLeft: '10px'}}>보관 관리</h1>
            </div>

            {/* 통계 카드 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
            }}>
                <div style={{
                    padding: '20px',
                    border: '2px solid #ff9900',
                    borderRadius: '8px',
                    backgroundColor: '#fff4e6',
                }}>
                    <div style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>
                        관리실 보관
                    </div>
                    <div style={{fontSize: '32px', fontWeight: 'bold', color: '#ff9900'}}>
                        {officeCount}
                    </div>
                </div>
                <div style={{
                    padding: '20px',
                    border: '2px solid #9933ff',
                    borderRadius: '8px',
                    backgroundColor: '#f2e6ff',
                }}>
                    <div style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>
                        보안실 보관
                    </div>
                    <div style={{fontSize: '32px', fontWeight: 'bold', color: '#9933ff'}}>
                        {securityCount}
                    </div>
                </div>
            </div>

            {/* 필터 */}
            <div style={{marginBottom: '20px', display: 'flex', gap: '10px'}}>
                <button
                    onClick={() => setFilter('ALL')}
                    style={{
                        padding: '8px 16px',
                        border: '1px solid #ddd',
                        backgroundColor: filter === 'ALL' ? '#0066cc' : 'white',
                        color: filter === 'ALL' ? 'white' : '#333',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    전체
                </button>
                <button
                    onClick={() => setFilter('OFFICE')}
                    style={{
                        padding: '8px 16px',
                        border: '1px solid #ddd',
                        backgroundColor: filter === 'OFFICE' ? '#ff9900' : 'white',
                        color: filter === 'OFFICE' ? 'white' : '#333',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    관리실 ({officeCount})
                </button>
                <button
                    onClick={() => setFilter('SECURITY')}
                    style={{
                        padding: '8px 16px',
                        border: '1px solid #ddd',
                        backgroundColor: filter === 'SECURITY' ? '#9933ff' : 'white',
                        color: filter === 'SECURITY' ? 'white' : '#333',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    보안실 ({securityCount})
                </button>
            </div>

            {error && (
                <div style={{
                    padding: '12px',
                    backgroundColor: '#ffe6e6',
                    color: '#cc0000',
                    borderRadius: '4px',
                    marginBottom: '20px',
                }}>
                    {error}
                </div>
            )}

            {/* 습득물 목록 */}
            {filteredItems.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                }}>
                    <p style={{fontSize: '16px', color: '#666'}}>
                        보관 중인 습득물이 없습니다.
                    </p>
                </div>
            ) : (
                <div style={{display: 'grid', gap: '16px'}}>
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '20px',
                                backgroundColor: 'white',
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'start',
                                marginBottom: '12px'
                            }}>
                                <div>
                  <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '4px',
                      fontSize: '12px',
                      marginRight: '8px',
                  }}>
                    {item.category}
                  </span>
                                    <StatusBadge status={item.status}/>
                                </div>
                                <span style={{
                                    padding: '4px 12px',
                                    backgroundColor: item.storageType === 'OFFICE' ? '#fff4e6' : '#f2e6ff',
                                    color: item.storageType === 'OFFICE' ? '#ff9900' : '#9933ff',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                }}>
                  {item.storageType === 'OFFICE' ? '관리실' : '보안실'}
                </span>
                            </div>

                            <h3 style={{margin: '0 0 8px 0', fontSize: '18px'}}>
                                {item.title}
                            </h3>

                            <p style={{
                                margin: '0 0 12px 0',
                                color: '#666',
                                fontSize: '14px',
                            }}>
                                {item.description}
                            </p>

                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f9f9f9',
                                borderRadius: '4px',
                                marginBottom: '12px',
                            }}>
                                <div style={{fontSize: '14px', marginBottom: '4px'}}>
                                    <strong>보관 위치:</strong> {item.storageLocation}
                                </div>
                                <div style={{fontSize: '13px', color: '#999'}}>
                                    습득: {formatDateTime(item.foundAt)} | 📍 {item.foundPlace}
                                </div>
                            </div>

                            <div style={{display: 'flex', gap: '10px'}}>
                                <button
                                    onClick={() => navigate(`/found/${item.id}`)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        backgroundColor: '#0066cc',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    상세 보기
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setStorageLocation(item.storageLocation);
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#ff9900',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    📦 보관 위치 변경
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 보관 위치 변경 모달 */}
            {selectedItem && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '90%',
                    }}>
                        <h3 style={{marginTop: 0}}>보관 위치 변경</h3>

                        <div style={{marginBottom: '12px'}}>
                            <strong>{selectedItem.title}</strong>
                        </div>

                        <div style={{marginBottom: '20px'}}>
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                                새 보관 위치
                            </label>
                            <input
                                type="text"
                                value={storageLocation}
                                onChange={(e) => setStorageLocation(e.target.value)}
                                placeholder="예: A구역 3번 선반"
                                style={{width: '100%', padding: '10px', fontSize: '14px'}}
                            />
                        </div>

                        <div style={{display: 'flex', gap: '10px'}}>
                            <button
                                onClick={handleUpdateStorage}
                                disabled={processing}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: processing ? '#ccc' : '#00cc66',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                }}
                            >
                                {processing ? '저장 중...' : '저장'}
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedItem(null);
                                    setStorageLocation('');
                                }}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
