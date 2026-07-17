import React from 'react';

import OutreachHeader from './OutreachHeader';

import OutreachTabs from './OutreachTabs';

import LeadsDesktopGrid from './LeadsDesktopGrid';

import LeadsMobileList from './LeadsMobileList';

import OutreachPagination from './OutreachPagination';

import LeadViewModal from './LeadViewModal';

import LeadEditModal from './LeadEditModal';

import LeadActionsMenu from './LeadActionsMenu';

import useEmailOutreach from './useEmailOutreach';

import useLeadActions from './useLeadActions';



export default function LeadsTable({ onComposeLead }) {

  const hub = useEmailOutreach();

  const actions = useLeadActions({ onComposeLead, refresh: hub.refresh });



  return (

    <div className="eo-leads-view">

      <OutreachHeader

        query={hub.query}

        onQueryChange={hub.setQuery}

        onFiltersClick={() => hub.setFiltersOpen((open) => !open)}

        onAddLead={() => actions.setEditLead({})}

      />



      {hub.error ? <div className="eo-filters-banner eo-filters-banner--error">{hub.error}</div> : null}



      {hub.filtersOpen ? (

        <div className="eo-filters-banner" role="status">

          Advanced filters coming soon. Use tabs and search for now.

        </div>

      ) : null}



      <OutreachTabs activeTab={hub.tab} counts={hub.tabCounts} onChange={hub.setTab} />



      <section className="eo-panel">

        <LeadsDesktopGrid rows={hub.rows} loading={hub.loading} rowHandlers={actions.rowHandlers} />

        <LeadsMobileList rows={hub.rows} loading={hub.loading} rowHandlers={actions.rowHandlers} onComposeLead={actions.handleCompose} />

        <OutreachPagination

          page={hub.currentPage}

          totalPages={hub.totalPages}

          pageSize={hub.pageSize}

          totalItems={hub.totalItems}

          onPageChange={hub.setPage}

        />

      </section>



      <LeadViewModal

        lead={actions.viewLead}

        onClose={actions.closeModals}

        onEdit={actions.openEdit}

        onCompose={actions.handleCompose}

        onDelete={actions.handleDelete}

      />

      <LeadEditModal lead={actions.editLead} onClose={actions.closeModals} onSaved={hub.refresh} />

      <LeadActionsMenu

        lead={actions.menuLead}

        onClose={actions.closeModals}

        onCompose={actions.handleCompose}

        onStatus={actions.handleStatus}

        onDelete={actions.handleDelete}

      />

    </div>

  );

}


