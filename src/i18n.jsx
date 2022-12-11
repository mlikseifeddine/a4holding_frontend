import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';

// the translations
// (tip move them in a JSON file and import them)
const resources = {
  "en-US": {
    translation: {
      // Globals
      welcome:"Welcome",
      wip:"Page under construction.",
      appTitle: "A4Holding Risk Management",
      dashboard: "Dashboard",
      assessment: "Assessment",
      resultsriskmaps: "Results and Risk Maps",
      riskmaps: "Risk maps",
      registry: "Registry",
      processes: "Processes",
      process: "Process",
      controls: "Controls",
      control: "Control",
      risks: "Risks",
      domainmanager: "Domain Manager",
      compliancemanager: "Compliance Manager",
      impactedrisks: "Impacted risks",
      linkedprocesses: "Linked processes",
      stage: "Stage",
      notes: "Notes",
      pagenotfound: "Ooops! The page you visited does not exist.",
      unauthorized: "Ooops! You're not authorized to view this page.",
      backto: "Back to",
      updatedat: "Updated at",
      createdAt: "Created at",
      back: "Back",
      send: "Send",
      delete: "Delete",
      yes: "Yes",
      no: "No",
      na: "N/A",
      emptyField: "The form cannot be empty.",
      info: "Informations",
      description: "Description",
      add: "Add",
      save: "Save",
      reject: "Reject",
      remove: "Remove",
      edit: "Edit",
      view: "View",
      actions: "Actions",
      reviewrequest: "Request review",
      question: "Question",
      questions: "Questions",
      showquestions: "Show questions",
      showprocesses: "Show processes",
      showrisks: "Show risks",
      viewonly: "(View only)",
      comments: "Comments",
      logout: "Log out",
      confirm: "Confirm",
      logoutconfirmation: "Are you sure you want to log out?",
      fieldnotmatching: "Names do not match!",
      deletecheck: "Insert password to delete.",
      confirmdelete: "Are you sure you want to delete this?",

      // Login
      loginUsernamePlaceholder: "Username",
      loginPasswordPlaceholder: "Password",
      wrongusernameorpassword: "Wrong username or password, please retry!",
      loginUsernameFormError: "You must insert a username.",
      loginPasswordFormError: "You must insert a password.",
      
      //Assessment
      selectSociety: "Select a society",
      emptyAssessment: "To view controls, select a society and one of the linked processes.",
      processname: "Sensitive process  (ISO 37001)" ,
      processdescription: "Sensitive activity",
      lastassessment: "Last assessment",
      status: "Status",
      tobecompiled: "To be compiled",
      inprogress: "In progress",
      completed: "Completed",
      failed: "Failed",
      score: "Score",
      processlist: "Process list",

      //AssessmentProcess
      controlslist: "Controls list",
      processinfo: "Process info",
      controlname: "Control code",
      controldescription: "Control title",
      deadline: "Deadline",
      deadlinemessage: "A deadline for this assessment has been set for date:",

      //Compilation
      assessmentcompilation: "Compiling assessment",
      assessmentcompleted: "Completed assessment",
      evaluation: "Evaluation",
      pending: "Pending",
      currentscore: "Current score",
      selfassessmentscoring: "Score is calculated as the mean of the selected answers' points. A score inferior to 3 will case the current assessment to fail.",
      emptynotes: "No notes have been added yet.",
      errorFileSizeExceeded: "File is too big to be uploaded.",
      filename: "Filename",
      filetype: "File type",
      filesize: "File size",
      selfassessmentok: "Self-Assessment Questionnaire passed.",
      selfassessmentfailed: "Self-Assessment Questionnaire failed.",
      canaddcomment: "If needed, you can write a comment regarding this assessment update. All comments will be saved and stored for their respective stage.",
      canadddeadline: "If needed, you can set a deadline for completion. The assessment will need to be updated/completed by the Domain Manager by the deadline here specified.",
      filequeuedforremoval: "File has been queued for removal.",
      filequeuedforadding: "File has been queued for uploading.",
      allquestionsneeded: "Please select all answers.",
      withdefaults: "With defaults.",
      nafalse: "N/A actually applies.",
      nodefaults: "No defaults.",
      natrue: "N/A does not apply.",
      result: "Result",
      reason: "Reason",
      selectdate: "Select date",
      evidencesnotsufficient: "Evidences existing but not sufficient.",
      evidencessufficient: "Sufficient evidences.",
      evidencesnonexistent: "Non existing evidences.",
      assessmentsubmitsuccess:"Assessment submitted successfully.",
      assessmentsubmiterror: "There was an error submitting the assessment.",
      requestconfirmation: "Are you sure you want to submit this assessment? Answers can't be changed later, so make sure they're right.",
      exportassessment: "Export assessment",

      //Processessandcontrols
      newprocess: "New process",
      editprocess: "Edit process",
      viewprocesses: "View processes",
      newcontrol: "New control",
      controlinfo: "Control info",
      clonecontrol: "Clone control",
      cloneprocess: "Clone process",
      handlecontrols: "Handle controls",
      seletedcontrols: "Selected controls",
      editcontrol: "Edit control",
      selectuser: "Select a user",
      selectcontrol: "Select a control",
      selectprocess: "Select a process",
      selectdomainmanager: "Select a domain manager",
      emptyprocesses: "Select a society to view and edit linked processes.",
      emptycontrols: "Select a society to view and edit linked controls.",
      connectedrisks: "Connected risks",
      stage2noquestions: "Stage 2 does not contain questions yet.",
      stage2noquestionssubtitle: "Add at least one question to advance.",
      stage3question: "Control requires compilation of stage 3?",
      requestedevidences: "What evidences does this control require?",
      newprocesssuccess: "New process added succesfully.",
      newprocesserror: "There was an error adding the new process.",
      editprocesswarning: "Warning",
      editprocesswarningtext: "Changing the Domain Manaeger for this process will cause any completed/pending assessments in the process to be discarded, and they will need to be compiled again. Uploaded evidences will be deleted as well.",
      editprocesscontrolswarningtext: "Removing linked controls will cause their relative assessment to be deleted, along with any uploaded evidences. Linking new processes will spawn new assessments.",
      editprocesssuccess: "Process edited successfully.",
      editprocesserror: "There was an error editing the process.",
      fieldsStillEmpty:"All fields must be compiled before saving.",
      newcontrolsuccess: "New control added successfully.",
      editcontrolconfirm: "Confirm control edit",
      editcontrolconfirmtext: "Are you sure you want to edit this control? Once edited, completed/pending assessments will need to be compiled again. Uploaded evidences will be deleted as well.", 
      newcontrolerror: "There was an error adding the new control.",
      editcontrolsuccess: "Control edited successfully.",
      editcontrolerror: "There was an error editing the control.", 
      setprocessescontrolssuccess: "Control added succesfully to process.",
      setprocessescontrolserror: "There was an error adding controls to the process.",
      deletecontrol: "Delete control",
      deletecontrolwarning: "Deleting this control will delete all pending assessments as well. Assessments from previous evaluations will not be modified.",
      deleteprocess: "Delete process",
      deleteprocesswarning: "Deleting this process will delete the pending assessment as well, including all linked control assessments. Assessments from previous evaluations will not be modified.",
      deletecontrolsuccess: "Control deleted successfully",
      deletecontrolerror: "There was an error deleting the control.",
      deleteprocesssuccess: "Process deleted successfully",
      deleteprocesserror: "There was an error deleting the process.",

      //Risks
      riskslist: "Risks list",
      emptyrisks: "Select a society to view and edit linked risks.",
      connectedcontrols: "Connected controls",
      newrisk:" New risk",
      editrisk: "Edit risk",
      riskname: "Risk name",
      riskdescription: "Risk description",
      inherentprobability: "Inherent probability",
      impact: "Impact",
      newrisksuccess: "New risk added successfully.",
      newriskerror: "There was an error adding the new risk.",
      editrisksuccess: "Risk edited successfully.",
      editriskerror: "There was an error editing the risk.",
      deleterisk: "Delete risk",
      deleteriskswarning: "Deleting this risk will case its evaluation to be removed. Previous evaluation will not be affected.",
      deleterisksuccess: "Risk eliminated successfully.",
      deleteriskerror: "There was an error eliminating the risk.",

      // Stage 2
      stage1: "Stage 1",
      stage1title: "Self-Assessment Questionnaire",

      // Stage 2
      stage2: "Stage 2",
      stage2title: "Assessing control effectiveness",

      // Stage 2
      stage3: "Stage 3",
      stage3title: "Assessing of evidences",

      // Questionnaire
      r1: "Formalization",
      r2: "Traceability and archiving period",
      r3: "Supervision",
      r4: "Prevention",
      r1_1: "Not defined with documentation.",
      r1_2: "Defined with documentation and not approved at least by manager.",
      r1_3: "Defined with documentation and approved at least by manager.",
      r1_4: "Defined in internal regulations and approved by the Regulations Committee.",
      r2_1: "There is no guarantee of traceability and it does not comply with the established legal term.",
      r2_2: "Guarantees traceability but does not comply with the established legal term.",
      r2_3: "Guarantees traceability and complies with the established legal term.",
      r2_4: "Guarantees traceability and archiving period is equal to or greater than 10 years.",
      r3_1: "Not automatic and annual.",
      r3_2: "Not automatic and less than or equal to 6 months.",
      r3_3: "Automatic and annual.",
      r3_4: "Automatic and less than or equal to 6 months.",
      r4_1: "Does not generate alerts and the control detects the criminal risk after it has occurred.",
      r4_2: "Generates alerts after criminal risk occurs.",
      r4_3: "Does not generate alerts but the control detects the criminal risk before it occurs.",
      r4_4: "Generates alerts before criminal risk occurs.",

      //Helpbox
      dms:" Domain Managers",
      dmsubtitle: "The Domain Managers are responsible for:",
      dmtext: [
      "Designing and implementing internal controls to prevent crimes from being committed.",
      "Documenting evidence of control.",
      "Justifying the control deficiencies identified.",
      "Having an inventory of the internal controls established to mitigate the criminal risks that may affect it.",
      "Notifying their corresponding Compliance unit of any change to or incidents with the control.",
      "Implementing all those corrective actions to deal with control deficiencies.",
      "Maintaining periodic internal control over the activities associated with their criminal risks.",
      ],
      cms: "Compliance Managers",
      cmsubtitle: "The Compliance Managers are responsible for:",
      cmtext: [
      "Assessing control design.",
      "Assessing, informing, advising and proposing corrective actions to the Domain Managers.", 
      "Reviewing the integrity and consistency of the control evidence.",
      "Assessing the effectiveness of criminal controls.",
      "Preparing the net criminal risk maps of global materialised and possible risks.",
      "Reviewing and reporting the net criminal risk maps to the Group's corresponding Management Committees and management bodies.",
      ],
      
      // Users
      users: "Users",
      userlist: "User list",
      newuser: "New user",
      edituser: "Edit user",
      name: "Name",
      username: "Username",
      auth: "Auth Level",
      password: "Password",
      societies: "Societies",
      newusersuccess: "User added successfully.",
      newusererror: "There was an error while adding the user.",
      editusersuccess: "User edited successfully.",
      editusererror: "There was an error while editing the user.",
      deleteuser: "Delete user",
      deleteuserwarning: "Deleting this user will remove it from all societies. Please unattach all processes before deleting.",
      deleteusererror: "There was an error deleting the user.",
      deleteusersuccess: "User deleted successfully.",

      // Results and Risk Maps
      emptyresults: "To view the results, select a society.",
      viewresults:"View results",
      riskinfo:"Risk info",
      previousresults:"Previous results",
      otherresults:"Other results",
      evaluationresults: "Evaluation results",
      riskinstanceassessments: "Assessments compiled for this evaluation",
      robustnessvalue: "Mean robustness value",
      inherentrisk: "Inherent risk",
      netrisk:"Net risk",
      netprobability:"Net probability",
      completedcontrols: "Completed controls",

      // Compilation History
      compilationhistory: "Assessment history",
      viewdeleted: "View deleted",
      previouscompilations: "Previous compilation",
      term: "Timeframe",
      archivedprocess: "The assessments shown below have been archived and are not editable. Process and assessments have been compiled for timeframe:",
      archivedassessmentview: "Viewing archived assessment",
      previouscompilationwarning: "Only archived processes and assessments are visible in this list. To see pending processes and assessments, use the 'Assessment' function on the sidebar.",


      // Dashboard

    },
  },

  "it-IT": {
    translation: {
      // Globals
      welcome: "Benvenuto",
      wip:"Pagina in costruzione.",
      appTitle: "A4Holding Risk Management",
      dashboard: "Dashboard",
      assessment: "Assessment",
      resultsriskmaps: "Risultati e Risk Maps",
      riskmaps: "Risk maps",
      registry: "Anagrafiche",
      processes: "Processi",
      process: "Processo",
      control: "Controllo",
      controls: "Controlli",
      risks: "Rischi",
      domainmanager: "Domain Manager",
      compliancemanager: "Compliance Manager",
      impactedrisks: "Rischi impattati",
      linkedprocesses: "Processi collegati",
      stage: "Stage",
      notes: "Note",
      pagenotfound: "Ooops! La pagina che stai cercando di visitare non esiste.",
      unauthorized: "Ooops! Non sei autorizzato a visitare questa pagina. ",
      backto: "Torna alla",
      updatedat: "Aggiornato il",
      createdAt: "Creato il",
      back: "Indietro",
      send: "Invia",
      delete: "Elimina",
      yes: "Si",
      no: "No",
      na: "N/A",
      emptyField: "Il campo non può essere vuoto.",
      info: "Informazioni",
      description: "Descrizione",
      add: "Aggiungi",
      save: "Salva",
      remove: "Rimuovi",
      reject: "Rifiuta",
      edit: "Modifica",
      view: "Visualizza",
      actions: "Azioni",
      reviewrequest: "Richiedi controllo",
      question: "Domanda",
      questions: "Domande",
      showquestions: "Mostra domande",
      showprocesses: "Mostra processi",
      showrisks: "Mostra rischi",
      comments: "Commenti",
      viewonly: "(Solo visualizzazione)",
      logout: "Termina sessione",
      confirm: "Conferma",
      logoutconfirmation: "Sei sicuro di voler uscire dalla sessione corrente?",
      fieldnotmatching: "Il nome inserito non coincide!",
      deletecheck: "Inserisci la password per eliminare.",
      confirmdelete: "Sei sicuro di voler procedere con l'eliminazione?",

      // Login
      loginUsernamePlaceholder: "Username",
      loginPasswordPlaceholder: "Password",
      wrongusernameorpassword: "L'username o la password non sono corretti, riprova!",
      loginUsernameFormError: "Devi inserire un username.",
      loginPasswordFormError: "Devi inserire una password.",

      //Assessment
      selectSociety: "Seleziona una società",
      emptyAssessment: "Per visualizzare i controlli, seleziona società e processo associato.",
      processname: "Processo sensibile (ISO 37001)",
      processdescription: "Attività sensibile",
      lastassessment: "Ultimo assessment",
      status: "Status",
      tobecompiled: "Da compilare",
      inprogress: "In corso",
      completed: "Completato",
      failed: "Fallito",
      score: "Punteggio",
      processlist: "Lista processi",

      //AssessmentProcess
      controlslist: "Lista controlli",
      processinfo: "Informazioni sul processo",
      controlname: "Codice controllo",
      controldescription: "Titolo controllo",
      deadline: "Deadline",
      deadlinemessage: "La deadline per questo assessment è fissata in data:",

      //Compilation
      assessmentcompilation: "Assessment in corso",
      assessmentcompleted: "Assessment completato",
      evaluation: "Valutazione",
      pending: "In corso",
      currentscore: "Punteggio attuale",
      selfassessmentscoring: "Il punteggio è calcolato come media dei punteggi delle risposte selezionate. Un punteggio complessivo inferiore a 3 produrrà un esito fallimentare sull'assessment in compilazione.",
      emptynotes: "Non sono state ancora aggiunte note.",
      errorFileSizeExceeded: "Il file selezionato è troppo pesante per il caricamento.",
      filename: "Nome del file",
      filetype: "Tipologia di file",
      filesize: "Dimensione del file",
      selfassessmentok: "Il questionario di self-assessment è stato superato.",
      selfassessmentfailed: "Il questionario di self-assessment non è stato superato.",
      canaddcomment: "Se necessario, puoi aggiungere un commento riguardo questo assessment update. Tutti i commenti saranno salvati nel loro corrispetivo stage.",
      canadddeadline: "Se necessario, puoi impostare una deadline per la completazione. L'assessment dovrà essere aggiornato/corretto dal Domain Manager entro la deadline specificata.",
      filequeuedforremoval: "Il file è stato aggiunto alla coda di rimozione.",
      filequeuedforadding: "Il file è stato aggiunto alla coda di upload.",
      allquestionsneeded: "Per favore, seleziona tutte le risposte.",
      withdefaults: "Con eccezioni.",
      nafalse: "N/A applicabile.",
      nodefaults: "Nessuna eccezione.",
      natrue: "N/A non applicabile.",
      result: "Risultato",
      reason: "Motivazione",
      selectdate: "Seleziona data",
      evidencesnotsufficient: "Documentazione presente ma non sufficiente.",
      evidencessufficient: "Documentazione sufficiente.",
      evidencesnonexistent: "La documentazione non esiste.",
      assessmentsubmitsuccess:"L'assessment è stato aggiornato con successo.",
      assessmentsubmiterror: "Si è verificato un errore durante l'aggiornamento dell'assessment.",
      requestconfirmation: "Sei sicuro di voler inviare questo assessment? Le risposte non possono essere modificate, quindi assicurati che siano corrette.",
      exportassessment: "Esporta assessment",

      //Processessandcontrols
      newprocess: "Nuovo processo",
      editprocess: "Modifica processo",
      viewprocesses: "Visualizza processi",
      newcontrol: "Nuovo controllo",
      controlinfo: "Informazioni controllo",
      clonecontrol: "Clona controllo",
      cloneprocess: "Clona processo",
      editcontrol: "Modifica controllo",
      handlecontrols: "Gestisci controlli",
      seletedcontrols: "Controlli selezionati",
      selectuser: "Seleziona un utente",
      selectcontrol: "Seleziona un controllo",
      selectprocess: "Seleziona un processo",
      selectdomainmanager: "Seleziona un domain manager",
      emptyprocesses: "Per visualizzare i processi, seleziona una società.",
      emptycontrols: "Per visualizzare i controlli, seleziona una società.",
      connectedrisks: "Rischi collegati",
      stage2noquestions: "Lo stage 2 non contiene ancora domande.",
      stage2noquestionssubtitle: "Aggiungi almeno una domanda per proseguire.",
      stage3question: "Il controllo richiede la compilazione dello stage 3?",
      requestedevidences: "Quali documenti sono richiesti dal controllo?",
      newprocesssuccess: "Nuovo processo aggiunto con successo.",
      newprocesserror: "Si è verificato un errore durante l'aggiunta del nuovo processo.",
      editprocesswarning: "Attenzione",
      editprocesswarningtext: "Modificare il domain manager associato al processo causerà l'eliminazione degli assessment compilati/in fase di compilazione, i quali dovranno essere compilati nuovamente. Anche i documenti caricati saranno eliminati.",
      editprocesscontrolswarningtext: "Rimuovere i processi collegati causerà l'eliminazione dei loro assessment, insieme all'eventuale documentazione qualora caricata. Collegare nuovi processi creerà automaticamente i nuovi assessment.",
      editprocesssuccess: "Processo modificato con successo.",
      editprocesserror: "Si è verificato un errore durante la modifica del processo.",
      fieldsStillEmpty:"Tutti i campi devono essere compilati prima di salvare.",
      newcontrolsuccess: "Nuovo controllo aggiunto con successo.",
      newcontrolerror: "Si è verificato un errore durante l'aggiunta del nuovo controllo.",
      editcontrolconfirm: "Conferma modifica controllo",
      editcontrolconfirmtext: "Sei sicuro di voler modificare questo controllo? Una volta modificato, tutti gli assessment compilati/in fase di compilazione dovranno essere compilati nuovamente. Anche i documenti caricati saranno eliminati.", 
      editcontrolsuccess: "Controllo modificato con successo.",
      editcontrolerror: "Si è verificato un errore durante la modifica del controllo.", 
      setprocessescontrolssuccess: "Controlli assegnati al processo con successo.",
      setprocessescontrolserror: "Si è verificato un errore durante l'assegnamento dei controlli.",
      deletecontrol: "Elimina controllo",
      deletecontrolwarning: "Eliminare questo controllo rimuoverà tutti le sue compilazioni in corso. Le compilazioni delle valutazioni precedenti non saranno modificate.",
      deleteprocess: "Elimina processo",
      deleteprocesswarning: "Eliminare questo processo rimuoverà la sua compilazione in corso, insieme a tutte le compilazioni dei controlli associati. Le compilazioni delle valutazioni precedenti non saranno modificate.",
      deletecontrolsuccess: "Controllo eliminato con successo.",
      deletecontrolerror: "Si è verificato un errore durante l'eliminazione del controllo.",
      deleteprocesssuccess: "Processo eliminato con successo.",
      deleteprocesserror: "Si è verificato un errore durante l'eliminazione del processo.",


      //Risks
      riskslist: "Lista rischi",
      emptyrisk: "Per visualizzare i rischi, seleziona una società.",
      connectedcontrols: "Controlli collegati",
      newrisk:" Nuovo rischio",
      editrisk: "Modifica rischio",
      riskname: "Nome rischio",
      riskdescription: "Descrizione rischio",
      inherentprobability: "Probabiità inerente",
      impact: "Impatto",
      newrisksuccess: "Nuovo rischio aggiunto con successo.",
      newriskerror: "Si è verificato un errore durante l'aggiunta del nuovo rischio.",
      editrisksuccess: "Rischio modificato con successo.",
      editriskerror: "Si è verificato un errore durante la modifica del rischio.",
      deleterisk: "Elimina rischio",
      deleteriskswarning: "Eliminare questo rischio rimuoverà la valutazione corrente. Le valutazioni precedenti non saranno modificate.",
      deleterisksuccess: "Rischio eliminato con successo.",
      deleteriskerror: "Si è verificato un errore durante l'eliminazione del rischio.",

      // Stage 2
      stage1: "Stage 1",
      stage1title: "Self-Assessment Questionnaire",

      // Stage 2
      stage2: "Stage 2",
      stage2title: "Assessing control effectiveness",

      // Stage 2
      stage3: "Stage 3",
      stage3title: "Assessing of evidences",

      // Questionnaire
      r1: "Formalizzazione",
      r2: "Tracciabilità e periodo di archiviazione",
      r3: "Supervisione",
      r4: "Prevenzione",
      r1_1: "Non definito con documentazione.",
      r1_2: "Definito con documentazione ma non approvato da almeno un manager.",
      r1_3: "Definito con documentazione ed approvato da almeno un manager.",
      r1_4: "Definito con regolamento interno e approvato dal Regulations Committee.",
      r2_1: "Non c'è garanzia di tracciabilità e non ottempera/soddisfa i termini legali stabiliti.",
      r2_2: "La tracciabilità è garantita ma non ottempera/soddisfa i termini legali stabiliti.",
      r2_3: "La tracciabilità è garantita e ottempera/soddisfa i termini legali stabiliti.",
      r2_4: "La tracciabilità è garantita ed il periodo di archviazione è uguale o superiore a 10 anni.",
      r3_1: "Non automatica e/o annuale.",
      r3_2: "Non automatica, minore o uguale a 6 mesi.",
      r3_3: "Automatica ed annuale.",
      r3_4: "Automatica, minore o uguale a 6 mesi.",
      r4_1: "Non genera allarmi ed il controllo rileva il rischio dopo l'accaduto.",
      r4_2: "Genera allarmi dopo l'accaduta del rischio.",
      r4_3: "Non genera allarmi ma rileva il rischio prima che accada.",
      r4_4: "Genera allarmi prima che accada il rischio.",

      //Helpbox
      dms:" Domain Managers",
      dmsubtitle: "I Domain Manager sono responsabili per:",
      dmtext: [
      "Design e implementazione dei controlli interni per la prevenzione del rischio.",
      "Documentazione delle evidences di controllo.",
      "Giustificazione dei deficit riportati nei controlli.",
      "Stabilire un inventario dei controlli interni per mitigare i rischi che possono avere effetto su di esso.",
      "Notificare al proprio Compliance unit modifiche o incidenti sul controllo.",
      "implementazione delle azioni correttive per trattare i controlli con deficit.",
      "Mantenere un controllo interno periodico sulle attività associate ai loro rischi.",
      ],
      cms: "Compliance Managers",
      cmsubtitle: "I Compliance Manager sono responsabili per:",
      cmtext: [
      "Valutare il design dei controlli.",
      "Valutare, informare, consigliare e proporre azioni correttive ai Domain Manager.", 
      "Controllare l'integrità e la consistenza dei controlli e delle evidences fornite.",
      "Valutare l'efficacia dei controlli.",
      "Preparare mappe di rischio netto di rischi globali possibili e materializzati.",
      "Review e reporting di mappe del rischio netto al corrispondende Management Committee del gruppo.",
      ],

      // Users
      users: "Utenti",
      userlist: "Lista utenti",
      newuser: "Nuovo utente",
      edituser: "Modifica utente",
      name: "Nome",
      username: "Username",
      auth: "Autenticazione",
      password: "Password",
      societies: "Società",
      newusersuccess: "L'utente è stato aggiunto con successo.",
      newusererror: "Si è verificato un errore durante l'aggiunta dell'utente.",
      editusersuccess: "L'utente è stato modificato con successo.",
      editusererror: "Si è verificato un errore durante la modifica dell'utente.",
      deleteuser: "Elimina utente",
      deleteuserwarning: "Eliminare qesto utente lo rimuoverà da tutte le società. Prima di procedere all'eliminazione, scollega l'utente da tutti i suoi processi.",
      deleteusererror: "Si è verificato un errore durante l'eliminazione dell'utente.",
      deleteusersuccess: "Utente eliminato con successo.",

      // Results and Risk Maps
      emptyresults: "Per visualizzare i risultati, seleziona una società.",
      viewresults:"Visualizza risultati",
      riskinfo:"Informazoni sul rischio",
      previousresults:"Valutazioni precedenti",
      otherresults:"Altre valutazioni",
      evaluationresults: "Risultato valutazione",
      riskinstanceassessments: "Assessment compilati per questa valutazione",
      robustnessvalue: "Robustezza media",
      inherentrisk: "Rischio inerente",
      netrisk:"Rischio netto",
      netprobability:"Probabilità netta",
      completedcontrols: "Controlli completati",

      // Compilation History
      compilationhistory: "Storico compilazioni",
      viewdeleted: "Visualizza eliminati",
      previouscompilations: "Compilazioni precedenti",
      term: "Periodo",
      archivedprocess: "Gli assessment sottostanti sono archiviati e non più modificabili. Il processo e gli assessment sono stati compilati per il periodo:",
      archivedassessmentview: "Visualizzazione assessment archiviato",
      previouscompilationwarning: "In questa lista sono presenti solamente processi inerenti ad assessment archiviati. Per visionare quelli in corso, utilizza la funzione di 'Assessment' sulla sidebar.",

      // Dashboard

    },
  },
};

const options = {
  order: ['localStorage', 'navigator', "htmlTag"], // If no language is set in localStorage, fallback to browser language.
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    supportedLngs: ["it-IT","en-US"], // This allows us to specify what languages are supported as a fallback mechanism.
    detection: options,
    keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;