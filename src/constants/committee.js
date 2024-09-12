export const COMMITTEE_ROLES = {
  CHAIR: {
    name: 'Chủ tịch',
    value: 'chair',
    defaultCount: 1,
  },
  SECRETARY: {
    name: 'Thư ký',
    value: 'secretary',
    defaultCount: 1,
  },
  REVIEWER: {
    name: 'Phản biện',
    value: 'reviewer',
    defaultCount: 2,
  }
}

export const CONTACT_STATUSES = {
  NOT_CONTACTED: {
    name: 'Chưa liên hệ',
    value: 'not_contacted',
  },
  CONTACTED: {
    name: 'Đã liên hệ',
    value: 'contacted',
  },
  ACCEPTED: {
    name: 'Đồng ý',
    value: 'accepted',
  },
  DECLINED: {
    name: 'Từ chối',
    value: 'declined',
  }
}

export const COMMITTEE_STATUSES = {
  NOT_STARTED: {
    name: 'Chưa bắt đầu',
    value: 'not_started',
  },
  WAITING: {
    name: 'Đang tìm kiếm',
    value: 'waiting',
  },
  DONE: {
    name: 'Đã chốt hội đồng',
    value: 'done',
  }
}