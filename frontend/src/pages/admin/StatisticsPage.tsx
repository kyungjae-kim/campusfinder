import {useState, useEffect, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {adminApi} from '@/api/admin.api';
import Loading from '@/components/common/Loading';

interface Statistics {
    lostCount: number;          // 기간별 분실 신고 수
    foundCount: number;         // 기간별 습득물 등록 수
    handoverCount: number;      // 인계 완료 수 (completedHandoverCount와 동일)
}

export default function StatisticsPage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<Statistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

    const getDateRangeByPeriod = useCallback((
        period: 'week' | 'month' | 'year'
    ) => {
        const end = new Date();
        const start = new Date();

        switch (period) {
            case 'week':
                start.setDate(end.getDate() - 7);
                break;
            case 'month':
                start.setMonth(end.getMonth() - 1);
                break;
            case 'year':
                start.setFullYear(end.getFullYear() - 1);
                break;
        }

        return {
            startDate: start.toISOString().slice(0, 10),
            endDate: end.toISOString().slice(0, 10),
        };
    }, []);

    const fetchStatistics = useCallback(async () => {
        try {
            setLoading(true);
            const { startDate, endDate } =
                getDateRangeByPeriod(period);

            const data = await adminApi.getStatistics(
                startDate,
                endDate
            );
            console.log(data);
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch statistics:', err);
        } finally {
            setLoading(false);
        }
    }, [period, getDateRangeByPeriod]);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    if (loading) return <Loading/>;
    if (!stats) return <div>통계를 불러올 수 없습니다.</div>;

    return (
        <div className="min-vh-100 bg-light">
            {/* 헤더 */}
            <nav className="navbar navbar-light bg-white shadow-sm mb-4">
                <div className="container-fluid">
                    <button
                        className="btn btn-link text-decoration-none"
                        onClick={() => navigate('/dashboard')}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        대시보드로 돌아가기
                    </button>
                </div>
            </nav>

            <div className="container py-4">
                {/* 타이틀 */}
                <div className="mb-4">
                    <h2 className="fw-bold mb-2">
                        <i className="bi bi-bar-chart text-danger me-2"></i>
                        운영 통계
                    </h2>
                    <p className="text-muted mb-0">플랫폼의 핵심 운영 현황을 확인하세요</p>
                </div>

                {/* 기간 선택 */}
                <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="bi bi-calendar-range me-2"></i>
                                조회 기간
                            </h5>
                            <div className="btn-group" role="group">
                                <input
                                    type="radio"
                                    className="btn-check"
                                    name="period"
                                    id="week"
                                    checked={period === 'week'}
                                    onChange={() => setPeriod('week')}
                                />
                                <label className="btn btn-outline-primary" htmlFor="week">
                                    최근 7일
                                </label>

                                <input
                                    type="radio"
                                    className="btn-check"
                                    name="period"
                                    id="month"
                                    checked={period === 'month'}
                                    onChange={() => setPeriod('month')}
                                />
                                <label className="btn btn-outline-primary" htmlFor="month">
                                    최근 30일
                                </label>

                                <input
                                    type="radio"
                                    className="btn-check"
                                    name="period"
                                    id="year"
                                    checked={period === 'year'}
                                    onChange={() => setPeriod('year')}
                                />
                                <label className="btn btn-outline-primary" htmlFor="year">
                                    최근 1년
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 핵심 통계 카드 (3개) */}
                <div className="row g-4">
                    {/* 분실 신고 수 */}
                    <div className="col-12 col-md-4">
                        <div className="card shadow-sm border-0 h-100 border-start border-primary border-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="text-muted mb-1">기간별 분실 신고 수</p>
                                        <h2 className="fw-bold mb-0 text-primary">{stats.lostCount}</h2>
                                        <p className="text-muted small mb-0 mt-2">
                                            {period === 'week' ? '최근 7일' : period === 'month' ? '최근 30일' : '최근 1년'}
                                        </p>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                                        <i className="bi bi-exclamation-circle fs-3 text-primary"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 습득물 등록 수 */}
                    <div className="col-12 col-md-4">
                        <div className="card shadow-sm border-0 h-100 border-start border-success border-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="text-muted mb-1">기간별 습득물 등록 수</p>
                                        <h2 className="fw-bold mb-0 text-success">{stats.foundCount}</h2>
                                        <p className="text-muted small mb-0 mt-2">
                                            {period === 'week' ? '최근 7일' : period === 'month' ? '최근 30일' : '최근 1년'}
                                        </p>
                                    </div>
                                    <div className="bg-success bg-opacity-10 p-3 rounded">
                                        <i className="bi bi-check-circle fs-3 text-success"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 인계 완료 수 */}
                    <div className="col-12 col-md-4">
                        <div className="card shadow-sm border-0 h-100 border-start border-info border-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="text-muted mb-1">인계 완료 수</p>
                                        <h2 className="fw-bold mb-0 text-info">{stats.handoverCount}</h2>
                                        <p className="text-muted small mb-0 mt-2">
                                            {period === 'week' ? '최근 7일' : period === 'month' ? '최근 30일' : '최근 1년'}
                                        </p>
                                    </div>
                                    <div className="bg-info bg-opacity-10 p-3 rounded">
                                        <i className="bi bi-check-all fs-3 text-info"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 설명 */}
                <div className="card shadow-sm border-0 mt-4">
                    <div className="card-body">
                        <h5 className="card-title mb-3">
                            <i className="bi bi-info-circle me-2"></i>
                            통계 안내
                        </h5>
                        <ul className="mb-0">
                            <li className="mb-2">
                                <strong>분실 신고 수:</strong> 선택한 기간 동안 등록된 분실 신고의 총 개수입니다.
                            </li>
                            <li className="mb-2">
                                <strong>습득물 등록 수:</strong> 선택한 기간 동안 등록된 습득물의 총 개수입니다.
                            </li>
                            <li>
                                <strong>인계 완료 수:</strong> 선택한 기간 동안 완료된 인계 건수입니다.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
