document.getElementById('cvForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const cvFile = document.getElementById('cvFile').files[0];
    const jobLevel = document.getElementById('jobLevel').value;
    
    const loader = document.getElementById('loader');
    const reportSection = document.getElementById('reportSection');
    const uploadSection = document.getElementById('uploadSection');

    if (!cvFile) {
        alert("Por favor, selecione um arquivo de currículo.");
        return;
    }

    loader.classList.remove('d-none');
    reportSection.classList.add('d-none');
    uploadSection.style.display = 'none';

    const formData = new FormData();
    formData.append('cv', cvFile);
    formData.append('nivel', jobLevel);

    try {
        // Lembre-se de substituir esta URL pela URL do seu backend no Hugging Face
        const response = await fetch('COLE_A_URL_DO_SEU_BACKEND_AQUI/analisar', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            let errorMsg = 'Ocorreu um erro no servidor.';
            try {
                const errorData = await response.json();
                errorMsg = errorData.erro || errorMsg;
            } catch (e) {
                errorMsg = await response.text();
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        displayReport(data, jobLevel);

    } catch (error) {
        alert(`Erro: ${error.message}`);
        uploadSection.style.display = 'block';
    } finally {
        loader.classList.add('d-none');
    }
});

function displayReport(data, jobLevel) {
    const reportSection = document.getElementById('reportSection');
    
    const score = data.scoreFinal;
    let scoreClass = 'bg-score-ruim';
    let scoreTextColor = 'text-white';

    if (score >= 80) scoreClass = 'bg-score-excelente';
    else if (score >= 60) {
        scoreClass = 'bg-score-bom';
        scoreTextColor = 'text-score-bom';
    }

    const keywordsOkHtml = data.analiseKeywords.encontradas.length > 0 ? 
        data.analiseKeywords.encontradas.map(kw => `<span class="keyword bg-success text-white"><i class="fas fa-check"></i> ${kw}</span>`).join('') : 
        '<p class="text-muted">Nenhuma competência chave do perfil foi encontrada.</p>';

    const keywordsNokHtml = data.analiseKeywords.sugeridas.length > 0 ?
        data.analiseKeywords.sugeridas.map(kw => `<span class="keyword bg-warning text-dark"><i class="fas fa-plus"></i> ${kw}</span>`).join('') :
        '<p class="text-muted">Parabéns! Todas as competências chave do perfil foram encontradas.</p>';

    const cargoBusca = jobLevel.replace('_', ' ') + " contabilidade";
    const termoBusca = encodeURIComponent(cargoBusca);
    
    const linksVagas = `
        <div class="mt-3">
            <h5 class="h6">Consultar Vagas em Tempo Real:</h5>
            <a href="https://www.linkedin.com/jobs/search/?keywords=${termoBusca}" target="_blank" class="btn btn-sm btn-outline-primary mb-2 me-2"><i class="fab fa-linkedin"></i> LinkedIn</a>
            <a href="https://portal.gupy.io/job-search/term=${termoBusca}" target="_blank" class="btn btn-sm btn-outline-success mb-2 me-2"><i class="fas fa-rocket"></i> Gupy</a>
            <a href="https://www.infojobs.com.br/empregos.aspx?palabra=${termoBusca}" target="_blank" class="btn btn-sm btn-outline-info mb-2 me-2"><i class="fas fa-info-circle"></i> InfoJobs</a>
            <a href="https://www.catho.com.br/vagas/${termoBusca.replace(/%20/g, '-')}/" target="_blank" class="btn btn-sm btn-outline-danger mb-2 me-2"><i class="fas fa-cat"></i> Catho</a>
        </div>
    `;

    const subTituloAnalise = "(Baseada no Perfil Padrão)";

    const reportHtml = `
        <div class="card p-4 shadow-lg">
            <h2 class="h3 text-center mb-4">Seu Relatório de Análise</h2>
            <div class="row align-items-center">
                <div class="col-md-4 text-center">
                    <div class="score-circle ${scoreClass} ${scoreTextColor}">${score}%</div>
                    <p class="h5 mt-3">Compatibilidade</p>
                </div>
                <div class="col-md-8">
                    <h4><i class="fas fa-lightbulb"></i> Diagnóstico Rápido</h4>
                    <p class="lead">${data.feedbackGeral}</p>
                    <p><strong><i class="fas fa-cogs"></i> Análise de Estrutura (${data.analiseEstrutura.score}%):</strong> ${data.analiseEstrutura.dica}</p>
                    ${linksVagas}
                </div>
            </div>
            <hr class="my-4">
            <div>
                <h4><i class="fas fa-key"></i> Análise de Competências ${subTituloAnalise}</h4>
                <div class="mb-3">
                    <h5 class="h6">Competências Encontradas no seu CV:</h5>
                    ${keywordsOkHtml}
                </div>
                <div>
                    <h5 class="h6">Sugestões de Competências para Adicionar:</h5>
                    ${keywordsNokHtml}
                </div>
            </div>
            <div class="text-center mt-4">
                 <button onclick="window.location.reload()" class="btn btn-secondary">
                    <i class="fas fa-redo"></i> Fazer Nova Análise
                </button>
            </div>
        </div>
    `;

    reportSection.innerHTML = reportHtml;
    reportSection.classList.remove('d-none');
}
