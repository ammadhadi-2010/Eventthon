import React, { useState } from 'react';

import { ChevronRight, Plus } from 'lucide-react';

import CreateTemplateModal from './CreateTemplateModal';



export default function OutreachTemplatesList({

  templates = [],

  loading = false,

  onSelectTemplate,

  onCreateTemplate,

  onViewAll,

}) {

  const [showCreate, setShowCreate] = useState(false);

  const [saving, setSaving] = useState(false);



  const handleSelect = (template) => {

    onSelectTemplate?.({

      subject: template.subject,

      body: template.body,

      templateId: template.id,

      templateTs: Date.now(),

    });

  };



  const handleSaveTemplate = async (payload) => {

    setSaving(true);

    try {

      const template = await onCreateTemplate?.(payload);

      if (template) {

        handleSelect({

          id: template.id,

          subject: template.subject,

          body: template.body,

        });

      }

      setShowCreate(false);

    } catch (err) {

      window.alert(err?.response?.data?.detail || err?.message || 'Failed to save template');

    } finally {

      setSaving(false);

    }

  };



  return (

    <section className="eo-panel eo-widget">

      <header className="eo-widget__head">

        <h2 className="eo-widget__title">Templates</h2>

        <button type="button" className="eo-link-btn" onClick={onViewAll}>

          View All

        </button>

      </header>

      {loading ? <p className="eo-template-status">Loading templates…</p> : null}

      <ul className="eo-template-list">

        {templates.map((item) => {

          const Icon = item.icon;

          return (

            <li key={item.id}>

              <button type="button" className="eo-template-item" onClick={() => handleSelect(item)}>

                <span className={`eo-template-icon eo-template-icon--${item.tone}`}>

                  <Icon size={15} aria-hidden />

                </span>

                <span className="eo-template-item__copy">

                  <span className="eo-template-item__title">{item.title}</span>

                  <span className="eo-template-item__sub">{item.subtitle}</span>

                </span>

                <ChevronRight size={14} className="eo-template-item__chev" aria-hidden />

              </button>

            </li>

          );

        })}

        <li>

          <button

            type="button"

            className="eo-template-item eo-template-item--custom"

            onClick={() => setShowCreate(true)}

          >

            <span className="eo-template-icon eo-template-icon--purple">

              <Plus size={15} aria-hidden />

            </span>

            <span className="eo-template-item__copy">

              <span className="eo-template-item__title">Custom Template</span>

              <span className="eo-template-item__sub">Create and save your own outreach template</span>

            </span>

            <ChevronRight size={14} className="eo-template-item__chev" aria-hidden />

          </button>

        </li>

      </ul>

      <CreateTemplateModal

        open={showCreate}

        saving={saving}

        onClose={() => setShowCreate(false)}

        onSave={handleSaveTemplate}

      />

    </section>

  );

}

