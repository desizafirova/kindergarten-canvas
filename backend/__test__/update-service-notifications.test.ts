import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock declarations must precede imports (jest.mock is hoisted)
const mockNewsGetOneDAO = jest.fn() as jest.Mock<any>;
const mockNewsUpdateDAO = jest.fn() as jest.Mock<any>;
const mockEventGetOneDAO = jest.fn() as jest.Mock<any>;
const mockEventUpdateDAO = jest.fn() as jest.Mock<any>;
const mockDeadlineGetOneDAO = jest.fn() as jest.Mock<any>;
const mockDeadlineUpdateDAO = jest.fn() as jest.Mock<any>;
const mockNotifyNewsPublished = jest.fn() as jest.Mock<any>;
const mockNotifyEventPublished = jest.fn() as jest.Mock<any>;
const mockNotifyDeadlinePublished = jest.fn() as jest.Mock<any>;

jest.mock('@dao/news/news_get_one_dao', () => ({ __esModule: true, default: mockNewsGetOneDAO }));
jest.mock('@dao/news/news_update_dao', () => ({ __esModule: true, default: mockNewsUpdateDAO }));
jest.mock('@dao/event/event_get_one_dao', () => ({ __esModule: true, default: mockEventGetOneDAO }));
jest.mock('@dao/event/event_update_dao', () => ({ __esModule: true, default: mockEventUpdateDAO }));
jest.mock('@dao/deadline/deadline_get_one_dao', () => ({ __esModule: true, default: mockDeadlineGetOneDAO }));
jest.mock('@dao/deadline/deadline_update_dao', () => ({ __esModule: true, default: mockDeadlineUpdateDAO }));
jest.mock('@services/email', () => ({
    notifyNewsPublished: mockNotifyNewsPublished,
    notifyEventPublished: mockNotifyEventPublished,
    notifyDeadlinePublished: mockNotifyDeadlinePublished,
}));
jest.mock('@utils/logger/winston/logger', () => ({
    __esModule: true,
    default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
jest.mock('@constants/event_constants', () => ({ EVENT_SELECT: {} }));
jest.mock('@constants/deadline_constants', () => ({ DEADLINE_SELECT: {} }));

import newsUpdateService from '../src/services/admin/news/news_update_service';
import eventUpdateService from '../src/services/admin/event/event_update_service';
import deadlineUpdateService from '../src/services/admin/deadline/deadline_update_service';

const PUBLISHED_NEWS = { id: 1, title: 'T', content: 'C', imageUrl: null, status: 'PUBLISHED', publishedAt: new Date(), createdAt: new Date(), updatedAt: new Date() };
const PUBLISHED_EVENT = { id: 2, title: 'E', eventDate: new Date(), location: null, description: null, status: 'PUBLISHED', publishedAt: new Date() };
const PUBLISHED_DEADLINE = { id: 3, title: 'D', deadlineDate: new Date(), isUrgent: false, description: null, status: 'PUBLISHED', publishedAt: new Date() };

describe('AC7: First-publish detection — news_update_service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockNotifyNewsPublished.mockResolvedValue(undefined);
    });

    it('does NOT notify when news is already published (re-publish)', async () => {
        // publishedAt is already set — this is a re-publish, NOT first publish
        mockNewsGetOneDAO.mockResolvedValue({ success: true, data: { id: 1, publishedAt: new Date() } });
        mockNewsUpdateDAO.mockResolvedValue({ success: true, data: PUBLISHED_NEWS });

        await newsUpdateService(1, { status: 'PUBLISHED', title: 'T', content: 'C' } as any);

        expect(mockNotifyNewsPublished).not.toHaveBeenCalled();
    });

    it('DOES notify on first publish (publishedAt was null)', async () => {
        // publishedAt is null — this is the first publish
        mockNewsGetOneDAO.mockResolvedValue({ success: true, data: { id: 1, publishedAt: null } });
        mockNewsUpdateDAO.mockResolvedValue({ success: true, data: PUBLISHED_NEWS });

        await newsUpdateService(1, { status: 'PUBLISHED', title: 'T', content: 'C' } as any);

        expect(mockNotifyNewsPublished).toHaveBeenCalledTimes(1);
    });

    it('does NOT notify on draft save (status=DRAFT)', async () => {
        mockNewsUpdateDAO.mockResolvedValue({ success: true, data: { ...PUBLISHED_NEWS, status: 'DRAFT', publishedAt: null } });

        await newsUpdateService(1, { status: 'DRAFT', title: 'T', content: 'C' } as any);

        // newsGetOneDAO should NOT be called at all for drafts (M4 fix)
        expect(mockNewsGetOneDAO).not.toHaveBeenCalled();
        expect(mockNotifyNewsPublished).not.toHaveBeenCalled();
    });
});

describe('AC7: First-publish detection — event_update_service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockNotifyEventPublished.mockResolvedValue(undefined);
    });

    it('does NOT notify when event is already published (re-publish)', async () => {
        mockEventGetOneDAO.mockResolvedValue({ success: true, data: { id: 2, publishedAt: new Date() } });
        mockEventUpdateDAO.mockResolvedValue({ success: true, data: PUBLISHED_EVENT });

        await eventUpdateService(2, { status: 'PUBLISHED', title: 'E', eventDate: new Date() } as any);

        expect(mockNotifyEventPublished).not.toHaveBeenCalled();
    });

    it('DOES notify on first event publish (publishedAt was null)', async () => {
        mockEventGetOneDAO.mockResolvedValue({ success: true, data: { id: 2, publishedAt: null } });
        mockEventUpdateDAO.mockResolvedValue({ success: true, data: PUBLISHED_EVENT });

        await eventUpdateService(2, { status: 'PUBLISHED', title: 'E', eventDate: new Date() } as any);

        expect(mockNotifyEventPublished).toHaveBeenCalledTimes(1);
    });

    it('returns 404 when event does not exist', async () => {
        mockEventGetOneDAO.mockResolvedValue({ success: false, data: null });

        const result = await eventUpdateService(99, { status: 'PUBLISHED', title: 'E', eventDate: new Date() } as any);

        expect(result.httpStatusCode).toBe(404);
        expect(mockNotifyEventPublished).not.toHaveBeenCalled();
    });
});

describe('AC7: First-publish detection — deadline_update_service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockNotifyDeadlinePublished.mockResolvedValue(undefined);
    });

    it('does NOT notify when deadline is already published (re-publish)', async () => {
        mockDeadlineGetOneDAO.mockResolvedValue({ success: true, data: { id: 3, publishedAt: new Date(), status: 'PUBLISHED' } });
        mockDeadlineUpdateDAO.mockResolvedValue({ success: true, data: PUBLISHED_DEADLINE });

        await deadlineUpdateService(3, { status: 'PUBLISHED', title: 'D', deadlineDate: new Date(), isUrgent: false } as any);

        expect(mockNotifyDeadlinePublished).not.toHaveBeenCalled();
    });

    it('DOES notify on first deadline publish (publishedAt was null)', async () => {
        mockDeadlineGetOneDAO.mockResolvedValue({ success: true, data: { id: 3, publishedAt: null, status: 'DRAFT' } });
        mockDeadlineUpdateDAO.mockResolvedValue({ success: true, data: PUBLISHED_DEADLINE });

        await deadlineUpdateService(3, { status: 'PUBLISHED', title: 'D', deadlineDate: new Date(), isUrgent: false } as any);

        expect(mockNotifyDeadlinePublished).toHaveBeenCalledTimes(1);
    });
});
