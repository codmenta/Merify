
import React, { useState } from 'react';
import styles from './DevolutionPage.module.css';
import apiClient from '../../api/apiClient';

const DevolutionPage = () => {
	const [orderId, setOrderId] = useState('');
	const [email, setEmail] = useState('');
	const [reason, setReason] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(null);
	const [error, setError] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setSuccess(null);
		setError(null);
		try {
			const res = await apiClient.post('/devolutions', {
				order_id: orderId,
				email,
				reason
			});
			setSuccess(res.data.message + ' Número de devolución: ' + res.data.devolution_id);
			setOrderId('');
			setEmail('');
			setReason('');
		} catch (err) {
			setError(err.response?.data?.detail || 'Error al solicitar la devolución');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.devolutionPage}>
			<div className={styles.devolutionContainer}>
				<h1 className={styles.devolutionTitle}>Solicitar devolución</h1>
				<form className={styles.devolutionForm} onSubmit={handleSubmit}>
					<input
						className={styles.input}
						type="text"
						placeholder="Número de orden"
						value={orderId}
						onChange={e => setOrderId(e.target.value)}
						required
					/>
					<input
						className={styles.input}
						type="email"
						placeholder="Correo electrónico"
						value={email}
						onChange={e => setEmail(e.target.value)}
						required
					/>
					<textarea
						className={styles.input + ' ' + styles.textarea}
						placeholder="Motivo de la devolución (opcional)"
						value={reason}
						onChange={e => setReason(e.target.value)}
					/>
					<button className={styles.button} type="submit" disabled={loading}>
						{loading ? 'Enviando...' : 'Solicitar devolución'}
					</button>
				</form>
				{success && <div className={styles.successMsg}>{success}</div>}
				{error && <div className={styles.errorMsg}>{error}</div>}
			</div>
		</div>
	);
};

export default DevolutionPage;