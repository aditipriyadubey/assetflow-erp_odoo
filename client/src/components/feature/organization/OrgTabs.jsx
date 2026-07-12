function OrgTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="border-b border-neutral-200">
      <nav className="-mb-px flex gap-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={[
              'whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default OrgTabs;
